---
title: 渲染管线总结
tags:
  - Rendering
categories:
  - Rendering
excerpt: 渲染管线的一般结构，Forward/Deferred/Tile-Based/Forward+ Rendering
comments: true
abbrlink: eeea93b8
date: 2022-08-26 07:06:06
---
# Overview

![](images/untitled.png)

渲染流水线的三个阶段：

* 应用阶段：输出图元

    开发者布置 scene
    
* 几何阶段：输出屏幕空间的的顶点信息

    **Vertex顶点着色器**(完全可编程)：cpu将顶点属性传到GPU中，每个顶点都会过一遍顶点着色器，且不能创建、销毁顶点，无法得到其他顶点的信息。因而顶点之间可以并行处理，速度快。

    **Tessellation曲面细分着色器**(完全可编程，可选)：细分图元

    **Geometry几何着色器**(完全可编程)：可以进行图元的着色，也可产生更多图元

    **Clipping裁剪**(不可编程，可以通过 early-z 提前到顶点着色器后)：将不再视锥内的顶点、片元剔除掉，可以自定义裁剪平面、选择剔除背面还是正面，这一步是硬件上的固定操作。

    **屏幕映射**(不可编程但可配置)：将每个图元转换到屏幕空间
    
* 光栅化阶段：

    **三角形设置&遍历**(不可编程)：输入为三角形的三个顶点，**三角形设置**的任务是得到三角形边界的表示，然后**遍历**会检查每个像素是否被三角形网格覆盖，若覆盖则生成一个片元，片元包含了屏幕坐标、深度等信息。

    **片元着色器**(完全可编程)：逐片元着色，片元着色器也是只影响单个片元，但是它可以访问导数信息(mipmap的基础)

    **输出合并阶段**(不可编程但可配置)：决定每个片元的可见性(先模板测试、再深度测试)，将通过测试的片元与已经在colorBuffer的颜色进行合并

    **输出合并阶段**(不可编程但可配置)：决定每个片元的可见性(先模板测试、再深度测试)，将通过测试的片元与已经在colorBuffer的颜色进行合并
    

图像真正出现在屏幕上，还要经过 double buffering 的策略才能使图像连续地呈现出来。

## Draw Call

 Draw Call 的本身含义就是 CPU 调用图像编程接口，比如 OpenGL 中的 glDrawElements，一般由 Draw Call 引起的性能瓶颈在于 CPU 和 GPU 的通信。CPU 和 GPU 通过**命令缓冲区**进行通信，CPU 向其中添加命令(改变渲染状态，渲染模型X)，GPU 从其中读命令然后执行。

* 为什么 draw call 多了会影响性能？可以类比复制很多个小文件和一个大文件
* 如何减少 draw call 的次数？可以进行 batching，比如可以在 CPU 中将场景中静态的大地、石头等静态物体进行一次合并。避免使用大量很小的 mesh，一定要使用的时候，尽量考虑进行 batching；避免使用过多材质，尽量不同 mesh 共用一个材质。

## Early-z

将原本 per-fragment 进行的 stencil-test、depth-test 提前到光栅化之后，没有通过测试的片元直接 discard 掉

![Untitled](images/untitled-1.png)

但是有些情况下不能用 early-z：

* 开启Alpha Test 或 clip/discard 等手动丢弃片元操作
* Alpha Blend
* 手动修改GPU插值得到的深度

> OpenGL 里面会根据 shader 的代码自动判断需不需要 early-z，如果 fragment shader 需要输出z的值，early-z 会被禁用。

## Z-Prepass

增加一个 Z-Prepass，其中只写入深度。

第二个 pass 中关闭深度写入，并将深度比较函数设置为相等。

# Render Pipeline

## Forward



![内循环主体是 light 的方式叫做 single-pass lighting，与之对应的是 multi-pass lighting](images/untitled-2.png)

内循环主体是 light 的方式叫做 single-pass lighting，与之对应的是 multi-pass lighting

透明物体：

![Untitled](images/untitled-3.png)

* 优点：光源少的时候优势明显，比较好处理透明物体，可以对不同的mesh应用不同的材质。
* 缺点及优化：整个场景的光照计算复杂度为 Mesh x Lights。需要针对性优化，比如 Multi-Pass Lighting 中可以设置每个光源影响的物体列表。通过剔除来降低 Overdraw，比如使用大物件的HZB，以及对动态物体使用 depth-only 提前绘制一遍的 Early-Z 剔除算法。

## Deferred

Deferred Rendering 可以概括为两个 Pass：

1. Geometry Pass，完成物体的几何数据处理，将光照计算所需要的数据写入到 GBuffer
2. Lighting Pass，通过一个后处理对每盏光源所覆盖的像素进行 shading，写入 FrameBuffer 

![Untitled](images/untitled-4.png)

延迟渲染中解耦了光源和mesh的作用

![Untitled](images/untitled-5.png)

* 优点：解决了 Forward Rendering 在多光源效率低下的问题。极大降低了 Forward Rendering 中的 Overdraw
* 缺点：

  * G-Buffer 要求更多的存储空间，材质越多会加重 G-Buffer的大小
  * 无法处理透明物体，需要额外的Pass
  * 不好实现 [MSAA](https://zhuanlan.zhihu.com/p/135444145)，需要 G-Buffer 开相应的倍数
  * 只能支持单一的 Lighting Model

## Deferred-Rendering with Transparent Objects

[GTA V - Graphics Study - Adrian Courrèges](http://www.adriancourreges.com/blog/2015/11/02/gta-v-graphics-study/)

## Why Forward Again?

Doom Eternal is using a Forward Rendering pipeline. 

Why？他们用了很多先进的pre-processing来处理光照、和物体，尽可能剔除掉不需要shading的部分，这样就大大降低了cpu和gpu之间的数据传输量。随着硬件的发展，drawcall的成本越来越小，gpu和cpu之间传数据逐渐成为新的 botttle neck。(其实不只有gpu和cpu之间的传输，在gpu内部也会频繁发生数据传输)

[DOOM Eternal - Graphics Study](https://simoncoenen.com/blog/programming/graphics/DoomEternalStudy.html)

[DOOM Eternal Tested on Low-end Graphics Cards](https://www.techspot.com/article/2001-doom-eternal-older-gpu-test/)

## Tile-Based Deferred Rendering

由于Deferred Shading 中的 G-Buffer 要求比较高的带宽，而移动端上带宽资源有限，Tile-Based Deferred Rendering 就是针对移动端设计的分块 Deferred Rendering。

其思想是将屏幕划分成子区域，分块渲染，这样在每一小块上的带宽不高，可以解决带宽的限制。听起来好像没有什么特别之处，但这个方案在实际应用中很快成为移动端硬件的标配。

## Forward+

也叫 Tiled Forward Rendering，可以概括为三个 Pass：

1. Depth Pass

   获取屏幕空间的 Depth 数据，为了后面逐 Tile 的 Light Culling，也是为了减少后面 Geometry Shading Pass 的 Overdraw
2. Lighting Cull Pass

   Forward Rendering 慢的原因就是每个片元都要考虑每盏灯光的影响，所以这里将灯光影响的像素范围进行计算。将屏幕空间分成 Tile，进行 Light Culling。根据 Tile Size 以及上一步获取到的 Depth Buffer，获取每个 Tile 的 Depth Extent，并根据每个 Tile 的 Sub Frustum 与 Light 的作用范围计算出影响到当前 Tile 的 Light List，整个过程可以通过 Compute Shader 完成（有Scatter跟Gather两种实现方案）
3. Geometry Shading Pass

   普通的 Forward Pass，每个片元着色的时候只与所在 Tile 相关的 Light List 进行光照计算。

# Reference

1. **[常见渲染管线整理与总结 - 简书 by离原春草](https://www.jianshu.com/p/6b5c9035b361)**
2. **[Shader学习 （20）延迟渲染和前向渲染](https://www.ai2news.com/blog/1444791/)**
3. **[Forward Rendering vs. Deferred Rendering](https://gamedevelopment.tutsplus.com/articles/forward-rendering-vs-deferred-rendering--gamedev-12342)**
4. **[Forward and Deferred Rendering](https://www.youtube.com/watch?v=n5OiqJP2f7w)**
5. **[Deferred Shading in* S.T.A.L.K.E.R.](https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-9-deferred-shading-stalker)**
6. **[The Early History of Deferred Shading and Lighting](https://sites.google.com/site/richgel99/the-early-history-of-deferred-shading-and-lighting)**
7. **[Tutorial 05 - Implementing Deferred Rendering](https://www.youtube.com/watch?v=BYo9xaU1sZg)**
8. **[DOOM Eternal Tested on Low-end Graphics Cards](https://www.techspot.com/article/2001-doom-eternal-older-gpu-test/)**
9. **[Forward-Plus-Renderer](https://github.com/bcrusco/Forward-Plus-Renderer)**
10. **[Introduction to Forward+ rendering - geometry pass | C++ Game Engine](https://www.youtube.com/watch?v=a9trwl4fEQs)**