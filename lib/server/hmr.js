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
    const updates = []
    for (const mod of modules) {
        const boundaries = new Set()
        propagateUpdate(mod, boundaries)
        updates.push(
            ...[...boundaries].map(({
                boundary,
                acceptedVia
            }) => ({
                type: `${boundary.type}-update`,
                path: boundary.url,
                acceptedPath: acceptedVia.url
            }))
        )
    }
    ws.send({
        type: 'update',
        updates
    })
}

function propagateUpdate(node, boundaries) {
    if (!node.importers.size) {
        return true
    }
    for (const importer of node.importers) {
        if (importer.acceptedHmrDeps.has(node)) {
            boundaries.add({
                boundary: importer,
                acceptedVia: node
            })
            continue
        }
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