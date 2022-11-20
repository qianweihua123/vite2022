<!--
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-16 16:39:24
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-20 19:02:26
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

  1.查找当前项目依赖的第三方模块
  2，把它们的 es module 版本进行打包，存放在 node_modules/.vite/deps 下
