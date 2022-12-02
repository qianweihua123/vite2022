const {
    init,
    parse
} = require('es-module-lexer')
const MagicString = require('magic-string');
const {
    lexAcceptedHmrDeps
} = require('../server/hmr');
const path = require('path');

//导入分析插件
function importAnalysisPlugin(config) {
    const {
        root
    } = config
    let server
    return {
        name: 'vite:import-analysis',
        configureServer(_server) { //配置服务器
            server = _server
        },

        //找到源文件中第三方模块进行转换 vue=>deps /vue.js
        async transform(source, importer) {
            // debugger
            await init //等待解析器初始化完成，这个 init 是个 promise
            //获取导入的模块
            let imports = []
            // if (!source.includes('const _sfc_main')) {
            imports = parse(source)[0]
            // }
            //如果没有导入就直接结束
            if (!imports.length) {
                return source
            }

            //拿到模块依赖图
            const {
                moduleGraph
            } = server
            //通过导入方的模块路径  拿到模块节点 importer类似于 main.js importerModule mmain.js的模块节点
            const importerModule = moduleGraph.getModuleById(importer)
            //此模块将要导入的子模块
            const importedUrls = new Set() //比如 main 里面导入了 renderModule.js
            //接收变更的依赖模块
            const acceptedUrls = new Set() //renderModule.js

            let ms = new MagicString(source);

            //重写路径
            const normalizeUrl = async (url) => {
                //解析此导入的模块的路径
                const resolved = await this.resolve(url, importer)
                if (resolved.id.startsWith(root + '/')) {
                    //把绝对路径变成相对路径
                    url = resolved.id.slice(root.length)
                }

                //解析导入的时候调用一下这个方法，建立此导入的模块和模块节点的对应关系，把所有的模块都放到关系图中
                await moduleGraph.ensureEntryFromUrl(url)

                return url;
            }

            //             const t init, parse J = require('es-module-1exer");
            // (async function ( {
            // const sourcecode =
            // import.meta.hot.accept(['./rendermodule. js’], ([renderModule])=>{
            // renderModule . render();
            // })；

            // await init;
            // const [imports, exports] = parse (sourcecode);
            // //console .1og(imports);
            // for (let index = 日; index < imports.1ength; index++）用
            // const { s: start, e: end, n: specifier } = imports[index];
            // const rawurl = sourcecode. slice(start, end);
            // console .log(rawUr1);//import.meta
            // B
            // }（;

            // y* import.meta. hot.accept (I" ./renderModule. js"], (Irendermodule])=>{
            // renderModule. render();
            // );

            for (let index = 0; index < imports.length; index++) {
                const {
                    s: start, //导入模块的起始位置
                    e: end, //导入模块的结束位置
                    n: specifier //模块名字 vue
                } = imports[index]
                const rawUrl = source.slice(start, end) //这里面可以拿到 import meta
                if (rawUrl === 'import.meta') {
                    //import.meta.hot.accept([" ./renderModule. js']
                    const prop = source.slice(end, end + 4)
                    if (prop === '.hot') { //如果是.hot说明是热更新的一个调用
                        if (source.slice(end + 4, end + 11) === '.accept') {
                            //此处存放的是原始的路径 相对的，也可能绝对的，也可以第三方的
                            lexAcceptedHmrDeps(source, source.indexOf('(', end + 11) + 1, acceptedUrls)
                        }
                    }
                }

                if (specifier) {
                    //normalizedUrl 传入 url == vue /node_ modules/.vite/deps/vue. js
                    const normalizedUrl = await normalizeUrl(specifier)
                    console.log(normalizedUrl, 'normalizedUrl', specifier);

                    if (normalizedUrl !== specifier) { //返回值和模块名不一样的话就重写路径
                        ms.overwrite(start, end, normalizedUrl) //重写路径
                    }
                    //把解析后的导入的模块ID添加到importedurls,importedUrls set结构
                    importedUrls.add(normalizedUrl)
                }
            }

            //处理acceptedUrls
            const normalizedAcceptedUrls = new Set()
            const toAbsoluteUrl = (url) =>
                path.posix.resolve(path.posix.dirname(importerModule.url), url)
            for (const {
                    url,
                    start,
                    end
                } of acceptedUrls) {
                const [normalized] = await moduleGraph.resolveUrl(toAbsoluteUrl(url), )
                normalizedAcceptedUrls.add(normalized)
                //重写源代码路径
                ms.overwrite(start, end, JSON.stringify(normalized))
            }
            //更新模块信息
            await moduleGraph.updateModuleInfo(
                importerModule,
                importedUrls,
                normalizedAcceptedUrls
            )

            return ms.toString() //返回
        }
    }
}
module.exports = importAnalysisPlugin;