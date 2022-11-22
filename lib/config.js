/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-15 15:58:40
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-22 15:06:54
 * @FilePath: /vite2022/lib/config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const {
  normalizePath
} = require('./utils'); //工具方法 格式化路径
const path = require('path');
//在 config 中放入一些插件
const {
  resolvePlugins
} = require('./plugins');

async function resolveConfig() {
  //process.cwd()在哪里执行这个，就指向这里的根目录
  const root = normalizePath(process.cwd());
  // const root = process.cwd()
  //指向 vite 下的缓存目录
  const cacheDir = normalizePath(path.resolve(`node_modules/.vite2022`))
  let config = {
    root, //根目录
    cacheDir
  };
  const plugins = await resolvePlugins(config) //得到是一个插件数组，里面有解析绝对路径的 resolvedid方法
  config.plugins = plugins //保存到 config 上
  return config; //返回一个对象
}
module.exports = resolveConfig;