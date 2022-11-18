/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-18 10:52:08
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-18 11:10:07
 * @FilePath: /vite2022/lib/plugins/resolve.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const fs = require('fs');
const path = require('path');
const resolve = require('resolve');

function resolvePlugin(config) {
    return {
        name: 'vite:resolve',
        //将任意情况传入的路径转成绝对路径
        resolveId(id, importer) {
            //如果/开头表示是绝对路径
            if (id.startsWith('/')) {
                return {
                    id: path.resolve(config.root, id.slice(1))
                };
            }
            //如果是绝对路径，那就直接返回，需要的就是绝对路径
            if (path.isAbsolute(id)) {
                return {
                    id
                }
            }
            //如果是相对路径
            if (id.startsWith('.')) {
                const basedir = path.dirname(importer);
                const fsPath = path.resolve(basedir, id)
                return {
                    id: fsPath
                };
            }
            //如果是第三方包
            let res = tryNodeResolve(id, importer, config);
            if (res) {
                return res;
            }
        }
    }
}

//处理第三方包的方法
function tryNodeResolve(id, importer, config) {
    //拿到包下面的 package.json
    const pkgPath = resolve.sync(`${id}/package.json`, {
        basedir: config.root
    })
    const pkgDir = path.dirname(pkgPath)
    //拿到内容
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    //拿到 module 字段，指向的是 esmodule 格式的入口，这是个规范
    const entryPoint = pkg.module
    //'module":dist/vue.runtime.esm-bundler.js",再加上 vue 拼上去
    const entryPointPath = path.join(pkgDir, entryPoint)
    return {
        id: entryPointPath
    }
}
module.exports = resolvePlugin;