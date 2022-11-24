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

const fs = require('fs-extra');


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
  //读取用户自己设置的插件
  //读取vite.config.js配置
  const jsconfigFile = path.resolve(root, 'vite.config.js')
  //判断文件是否存在
  const exists = await fs.pathExists(jsconfigFile)
  if (exists) { //存在的话，加载jsconfigFile
    const userConfig = require(jsconfigFile);
    config = { //组合，将配置文件的配置项，组合到 config,用户定义的配置覆盖默认配置
      ...config,
      ...userConfig
    };
  }
  //拿到插件，拿到用户配置的插件
  const userPlugins = config.plugins || [];

  const plugins = await resolvePlugins(config, userPlugins) //得到是一个插件数组，里面有解析绝对路径的 resolvedid方法，这里又合并了用户的插件
  config.plugins = plugins //保存到 config 上
  return config; //返回一个对象
}
module.exports = resolveConfig;