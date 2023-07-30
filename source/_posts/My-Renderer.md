---
abbrlink: 4a17b156
categories:
- Engine
comments: false
date: '2022-08-26T17:11:48.217000+08:00'
excerpt: 一个 C++ 实现的 OpenGL 渲染小引擎 <img src="/images/myRenderer/GEngine-OBJ.jpeg" width="100%" height="100%">
tags:
- Engine
title: My Renderer
updated: 2023-7-30T22:47:53.506+8:0
---
Github地址：[MyRenderer](https://github.com/tipsypotato/myRenderer)

# Overview

一个很简单的 OpenGL 渲染引擎，支持 glTF 和 obj 的模型导入、PBR 材质、IBL、简单的 UI 面板等特性

# Feature

* **glTF 模型导入，PBR 材质**

<img src="/images/myRenderer/gengine-gltf-pbr.jpeg" width="100%" height="100%">

* **IBL**

<img src="/images/myRenderer/gengine-ibl-2.jpeg" width="100%" height="100%">

* **Debug Mode**

<img src="/images/myRenderer/gengine-gltf-pbr-debug.jpeg" width="100%" height="100%">

* **ShadowMap**

<video width="70%" height="70%" src="/images/myRenderer/shadowmap.mov" controls="controls"></video>

* **骨骼动画**

<video width="100%" height="100%" src="/images/myRenderer/mascot-animation.mp4" controls="controls"></video>

* **骨骼动画(with blending)**

<video width="100%" height="100%" src="/images/myRenderer/blend-animation.mp4" controls="controls"></video>

* **面光源**

<img src="/images/myRenderer/gengine-ltc-light.png" width="100%" height="100%">

# Todo

写这个小引擎主要是熟悉工程的构建流程以及引擎结构相关的知识，完成一些简单的渲染工作（比如一些图形学算法的实现）
