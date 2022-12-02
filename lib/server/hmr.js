const path = require('path');

//有限状态机
const LexerState = {
    inCall: 0, //方法调用中
    inSingleQuoteString: 1, //在字符串中，引号里面就是 1
    inTemplateString: 2
}

function getShortName(file, root) {
    return file.startsWith(root + '/') ? path.posix.relative(root, file) : file
}

/**
 * 当检测到文件发生改变后，处理热更新 向上冒泡，找到接收方去处理，没人处理刷新浏览器
 * 要想处理这个冒泡的过程
知道什么信息？
1.知道哪些模块导入了哪些模块
2.知道父模块可以接收哪些子模块的变更
 * @description 描述 file 变化的文件
 * @param {*}
 * @returns {*}
 */
async function handleHMRUpdate(file, server) {
    debugger
    const {
        config,
        moduleGraph
    } = server
    const shortFile = getShortName(file, config.root)
    const modules = moduleGraph.getModulesByFile(file) || []
    updateModules(shortFile, modules, server)
}

function updateModules(file, modules, {
    ws
}) {
    debugger
    const updates = []
    for (const mod of modules) {
        const boundaries = new Set()
        debugger
        propagateUpdate(mod, boundaries) //广播
        //广播之后
        updates.push(
            ...[...boundaries].map(({
                boundary,
                acceptedVia
            }) => ({
                type: `${boundary.type}-update`,
                path: boundary.url, //谁更新了 边界
                acceptedPath: acceptedVia.url //通过谁更新了，接受谁的更新 变更的模块路径
            }))
        )
    }
    //发送消息给客户端
    ws.send({
        type: 'update',
        updates
    })
}

//广播更新
function propagateUpdate(node, boundaries) {
    if (!node.importers.size) { //如果没有人引用就处理不处理
        return true
    }
    //
    for (const importer of node.importers) {
        //如果它接受的热更新模块里面包含这个模块的话
        //这得暂时注释掉，不然判断是否包含的时候走不进去，前面我们给 resolvedepmodule 加了依赖的模块 main.js，但是importer.acceptedHmrDeps里面没加进去    .importers.add(mod) //让renderModule的importers里添加main
        // if (importer.acceptedHmrDeps.has(node)) {
        boundaries.add({ //那就添加一个边界
            boundary: importer, //边界就是接收变更的模块
            acceptedVia: node //通过谁得到的变更，就是变更的模块
        })
        continue
        // }
    }
    return false;
}
//有限状态机
/*

@param {*} code模块源代码
@param 〔*} start 开始查找位置
@param {*}acceptedurls 解析到热更新依赖后放到哪个集合里
*/
//code源代码 start 起始位置 urls 是 acceptedUrls
function lexAcceptedHmrDeps(code, start, urls) {
    let state = LexerState.inCall
    let prevState = LexerState.inCall
    let currentDep = '' //当前的依赖名

    function addDep(index) {
        urls.add({
            url: currentDep,
            start: index - currentDep.length - 1,
            end: index + 1
        })
        currentDep = ''
    }
    for (let i = start; i < code.length; i++) {
        const char = code.charAt(i)
        switch (state) {
            case LexerState.inCall: //遇到单引号
                if (char === `'`) {
                    prevState = state
                    state = LexerState.inSingleQuoteString
                }
                break
            case LexerState.inSingleQuoteString: //遇到./里面的.
                if (char === `'`) {
                    addDep(i)
                    return false
                } else {
                    currentDep += char
                }
                break
            default:
                break;
        }
    }
    return false
}
exports.handleHMRUpdate = handleHMRUpdate;
exports.updateModules = updateModules;
exports.lexAcceptedHmrDeps = lexAcceptedHmrDeps;