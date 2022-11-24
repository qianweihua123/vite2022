const {
    init,
    parse
} = require('es-module-lexer')
const MagicString = require('magic-string');

//导入分析插件
function importAnalysisPlugin(config) {
    const {
        root
    } = config
    return {
        name: 'vite:import-analysis',
        //找到源文件中第三方模块进行转换 vue=>deps /vue.js
        async transform(source, importer) {
            debugger
            await init //等待解析器初始化完成，这个 init 是个 promise
            //获取导入的模块
            let imports = []
            if (!source.includes('const _sfc_main')) {
                imports = parse(source)[0]
            }
            //如果没有导入就直接结束
            if (!imports.length) {
                return source
            }
            let ms = new MagicString(source);

            //重写路径
            const normalizeUrl = async (url) => {
                //解析此导入的模块的路径
                const resolved = await this.resolve(url, importer)
                if (resolved.id.startsWith(root + '/')) {
                    //把绝对路径变成相对路径
                    url = resolved.id.slice(root.length)
                }
                return url;
            }
            for (let index = 0; index < imports.length; index++) {
                const {
                    s: start, //导入模块的起始位置
                    e: end, //导入模块的结束位置
                    n: specifier //模块名字 vue
                } = imports[index]
                if (specifier) {
                    //normalizedUrl 传入 url == vue /node_ modules/.vite/deps/vue. js
                    const normalizedUrl = await normalizeUrl(specifier)
                    console.log(normalizedUrl, 'normalizedUrl', specifier);

                    if (normalizedUrl !== specifier) { //返回值和模块名不一样的话就重写路径
                        ms.overwrite(start, end, normalizedUrl) //重写路径
                    }
                }
            }
            return ms.toString() //返回
        }
    }
}
module.exports = importAnalysisPlugin;