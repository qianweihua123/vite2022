/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-16 17:08:28
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-20 18:54:18
 * @FilePath: /vite2022/lib/optimizer/scan.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const {
    build //借助 esbuild 去扫描
} = require('esbuild');
const esbuildScanPlugin = require('./esbuildScanPlugin');
const path = require('path');
//扫描项目中导入的第三方模块
async function scanImports(config) {
    //存放依赖导入
    const depImports = {};
    //esbuildScanPlugin是一个方法，用来创建一个 esbuild 扫描插件
    const esPlugin = await esbuildScanPlugin(config, depImports); //写了一个 esbuild 插件，这里面先去处理 vite 的插件，然后定义看 esbuild 运行的插件就是 onresolve 和 onload
    await build({
        absWorkingDir: config.root, //当前的工作目录
        entryPoints: [path.resolve('./index.html')], //指定编译 的入口
        bundle: true, //打包
        format: 'esm',
        outfile: 'dist/index.js', //输出文件
        write: false, //在真实的代码中这个值为 false,不需要写入硬盘
        plugins: [esPlugin]
    })
    return depImports;
}
module.exports = scanImports;