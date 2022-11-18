/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-16 17:15:03
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-18 11:01:21
 * @FilePath: /vite2022/lib/optimizer/esbuildScanPlugin.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const fs = require('fs-extra');
const path = require('path');
const {
    createPluginContainer
} = require('../server/pluginContainer');
//专门处理路径的插件
const resolvePlugin = require('../plugins/resolve');
const {
    normalizePath
} = require('../utils');
const htmlTypesRE = /\.html$/
//拿到 html 后，匹配的正则
const scriptModuleRE = /<script type="module" src\="(.+?)"><\/script>/;
const JS_TYPES_RE = /\.js$/;


/**
 * @description 描述 这是一个 ebuild 插件
 * @param {config,depImports}配置对象 root  用来存放导入的模块
 * @returns {*}
 */
async function esbuildScanPlugin(config, depImports) {
    //resolvePlugin返回对象{name，resolvedId}，所以这createPluginContainer循环的时候才能调用 resolvedId
    config.plugins = [resolvePlugin(config)];
    //创建一个插件容器，里面有 resolveId方法，解析出绝对路径
    const container = await createPluginContainer(config)
    //解析路径的方法 resolve方法，是createPluginContainer返回的，去解析绝对路径
    const resolve = async (id, importer) => {
        //插件容器进行路径解析，返回绝对路径
        return await container.resolveId(id, importer)
    }
    return {
        name: 'vite:dep-scan',
        setup(build) {
            //找路径,入口文件是 index.html,找到它的真实路径，匹配上了走回调
            build.onResolve({
                filter: htmlTypesRE
            }, async ({
                path,
                importer
            }) => {
                //调用 resolve方法拿到importer的路径,这个 path 可能是相对，也可能是绝对路径,也可能第三方
                const resolved = await resolve(path, importer) //绝对路径
                if (resolved) { //有值的话，返回一个对象，返回路径和命名空间
                    return {
                        path: resolved.id || resolved,
                        namespace: 'html'
                    }
                }
            })
            build.onResolve({
                filter: /.*/ //匹配任意文件
            }, async ({
                path, //第一次加载后发现 main.js依赖其他文件，就会走到这传入 main.js,每个模块都要解析路径，然后读取内容
                importer
            }) => {
                const resolved = await resolve(path, importer)
                if (resolved) {
                    const id = resolved.id || resolved; //id 就是此模块的绝对路径
                    const included = id.includes('node_modules'); //如果 id 里面包含 node_modules 说明包含第三方模块，可以给depImports赋值收集
                    if (included) {
                        depImports[path] = normalizePath(id)
                        return {
                            path: id, //路径
                            external: true //表示这是一个外部模块，不需要进一步处理
                        }
                    }
                    //不包含 node_modules那就是内部模块，接着根据路径去读取内容
                    return {
                        path: id
                    }
                }
                return {
                    path
                }
            })

            //得到路径后，读内容这儿传入了一个对象，可以看到命名空间的名字，捕获的就是我们上面返回的对象
            //在这一步读取内容后发现里面依赖了脚本/src/main.js 又会走到onResolve（找路径filter: /.*/那一步）
            build.onLoad({
                filter: htmlTypesRE,
                namespace: 'html'
            }, async ({
                path //这的 path 是上一步返回的 fath，绝对路径
            }) => {
                //需要将 html转成 js才能继续处理
                //读取html内容
                let html = fs.readFileSync(path, 'utf-8')
                //拿到 html内容后，匹配内容 scriptSrc得到脚本的路径 src(import /src/main.js那种)
                let [, scriptSrc] = html.match(scriptModuleRE);
                //拿到脚本的内容
                let js = `import ${JSON.stringify(scriptSrc)};\n`
                return { //返回一个对象，content 是读取到的内容，当加载 main.js后发现依赖其他内容，又会去            build.onResolve({filter: /.*/},
                    loader: 'js',
                    contents: js
                }
            })

            build.onLoad({
                filter: JS_TYPES_RE
            }, ({
                path: id
            }) => {
                let ext = path.extname(id).slice(1)
                let contents = fs.readFileSync(id, 'utf-8')
                return {
                    loader: ext,
                    contents
                }
            })
        }
    }
}
module.exports = esbuildScanPlugin;

// 第一次先处理index.html
// 先执行 build.onResolve({ filter: htmlTypesRE }
// 发现过滤器能匹配上，return {path}
// 如果有任何一个回调有返回了，则会跳过剩下的onResolve
// webpack bail rollup first
// 走build.onLoad({ filter:htm1TypesRE
// I
// 过滤匹配上，执行回调，返回 return fcontents}
// 如果onLoad返回内容，直接会进行解析流程，不再走默认的读取文件操作了