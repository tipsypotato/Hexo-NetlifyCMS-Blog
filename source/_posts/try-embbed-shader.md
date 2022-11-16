---
excerpt: 尝试将shader嵌入blog
summary: null
toc: true
abbrlink: 140ab620
date: 2022-11-16T09:08:49.523Z
top: false
cover: false
title: 尝试嵌入shader
tags: []
mathjax: false
password: null
categories: []
---

using [glslCanvas](https://github.com/patriciogonzalezvivo/glslCanvas), shader comes from [https://www.shadertoy.com/view/4sfGzS](https://www.shadertoy.com/view/4sfGzS)

<script type="text/javascript" src="https://rawgit.com/patriciogonzalezvivo/glslCanvas/master/dist/GlslCanvas.js"></script>
<canvas class="glslCanvas" data-fragment-url="/glsl/shaders/shader.frag" width="300" height="300"></canvas>

<link type="text/css" rel="stylesheet" href="/js/glsl/glslEditor.css">
<script type="application/javascript" src="/js/glsl/glslEditor.js"></script>

using [glslEditor](https://github.com/patriciogonzalezvivo/glslEditor) to edit shader realtime, but it seems glslEditor is no longer maintained...

<body>
    <div id="glsl_editor">
precision mediump float;

uniform vec2 u_resolution;

uniform float u_time;

void main()

{

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  vec3 col = vec3(uv.x, uv.y, 0.0);

  gl_FragColor = vec4( col * abs(sin(u_time)), 1.0 );

}
</div>
</body>
<script type="text/javascript">
    const glslEditor = new GlslEditor('#glsl_editor', { 
        canvas_size: 200,
        canvas_draggable: true,
        theme: 'monokai',
        multipleBuffers: true,
        canvas_follow: true,
        watchHash: false,
        fileDrops: true,
        menu: false
    });
</script>