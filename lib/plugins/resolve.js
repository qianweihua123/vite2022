/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-18 10:52:08
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-18 10:52:25
 * @FilePath: /vite2022/lib/plugins/resolve.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const fs = require('fs');
const path = require('path');
const resolve = require('resolve');

function resolvePlugin(config) {
    return {
        name: 'vite:resolve',
        resolveId(id, importer) {
            //如果/开头表示是绝对路径
            if (id.startsWith('/')) {
                return {
                    id: path.resolve(config.root, id.slice(1))
                };
            }
            //如果是绝对路径
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

function tryNodeResolve(id, importer, config) {
    const pkgPath = resolve.sync(`${id}/package.json`, {
        basedir: config.root
    })
    const pkgDir = path.dirname(pkgPath)
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    const entryPoint = pkg.module
    const entryPointPath = path.join(pkgDir, entryPoint)
    return {
        id: entryPointPath
    }
}
module.exports = resolvePlugin;