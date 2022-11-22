<!--
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-16 16:39:24
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-22 15:03:48
 * @FilePath: /vite2022/step.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

## 项目启动第一步

- 查找当前项目依赖的第三方模块
- 把它们的 es module 版本进行打包，存放在 .vite 目录下 (预构建)node_modules/.vite
  node_modules/.vite/deps/vue.js /依赖的第三方模块/
  node_modules/.vite/deps/\_metadata.json 原数据
  node_modules/.vite/deps 缓存存放目录
  它是一个 json
  {
  "hash": "63dbd334",
  "browserHash": "a188cec3",
  "optimized": {//优化,key 是引入的包名，值主要是 src 和 file
  "vue": {
  "src": "../../_vue@3.2.45@vue/dist/vue.runtime.esm-bundler.js",
  "file": "vue.js",
  "fileHash": "15c80a8d",
  "needsInterop": false
  }
  },
  "chunks": {}
  }

  - 1.查找当前项目依赖的第三方模块
  - 2，把它们的 es module 版本进行打包，存放在 node_modules/.vite/deps 下
  - 3.重写模块中的导入路径，我们最初的 main.js 文件中引入是一个 import {createApp} from "vue",在 vite 的实现中还会改写这个引入的路径 import { createApp } from '/node_modules/.vite/deps/vue.js?v=a188cec3',所以当启动项目后客户端访问我们的原路径的时候进行拦截，返回我们上一步预编译的脚本路径

为什么要先编译发了叫这样可以减少 http 请求
index.js a b c d 100.js
请客户端 index.js，再去请求 at
d 100 个请求
服务器启动前
index a b c d 1090 合并成一个文件
后面请求的时候请求一个文件就可以

esbuild 执行了几次？？
至少是一次
找依赖
然后有多少第三方依赖就再执行多次少
1+n 次

将插件容器放到了 server（单例的容器） 上，是因为项目多个地方用到了，方便共享
