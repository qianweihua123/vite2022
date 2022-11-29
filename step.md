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

请求样式的时候，会在编译的脚本中 import 样式文件
import “/src/App. vue ?vue&type=style&index=0&1ang.css\*

然后浏览器请求这个文件
App.vue?vue&type=style &index=0&lang.css 请求这个文件

首先在 transforMain 这获取样式代码放到头部
const stylecode = genstyleCode (descriptor， filename);
let code =[
stylecode,
scriptcode,
templatecode,
sfc_main.render = render;
‘export default -sfc_main;
J.join("In");
return { code ]

它其实是找到样式块进行循环，每个样式块变成一个 import 语句
function genstylecode (descriptor • filename） {
let stylecode =
if (descriptor.styles.length > 0）{
descriptor. styles. forEach((style,-index)-=>tI
const query =•?vue&type=style&index=$ index}&lang.css°
const styleRequest = (filename + query ).replace(/V/g,
//import "/src/App. vue?vue&type=style&index=0&1ang. css"
stvlecode += Inimport "$istyleReauest]"
})；
return stylecode ‘ )：：

变成 import 语句后浏览器会再次发送请求
那就回走到我们处理文件的钩子方法 load 里面，返回样式对应的代码
async load (id) t
const { filename, query } = parsevueRequest (id);
if (query .has('vue" )){
const descriptor = await getDescriptor(filename);
if (query.get (“type ") === 'style") {
let styleBlock = descriptor.styles [Number (query.get ("index’ ))];
I if (styleBlock)k
return { code: styleBlock.content };//h1fcolor:red}

load 钩子后面是 transformMain 钩子
async transform( code, id) {
const { filename， query ] = parsevueRequest (id) ;// /spc/App. vue
if (filename .endsWith(".vue")）{
if (query.get('type") === 'style"){
const descriptor = await getDescriptor(filename);
let result = await transformstyle(code, descriptor, Number (query.get('in
return result;
] else {
return await transformMain(code, filename)；

}
return nul1;

这里面去编译并且返回一个 code，里面去创建 style 标签，添加内容，放到文本头部
async function transformstyle(code, descriptor, index)
e const styleBlock = descriptor.styles [index];
const.result.= await. compilestyleAsync ({
filename :descriptor.filename，//文件名
-source: code,//样式的源代码
id:data-v-$tdescriptor.idj，/1 为了实现局部作用域，需要一个唯一的 ID
scoped:t styleBlock.scoped//实现局部样式
}）；
let stylecode = result.code;
return
code :
var style = document . createElement ('style");
style.innerHTML = ${JSON.stringify(stylecode);
document .head.appendchild(style);
