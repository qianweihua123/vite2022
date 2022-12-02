const path = require('path');

/**
 * @description 描述模块节点，代表一个模块
 * @param {*}
 * @returns {*}
 */
class ModuleNode {
    //哪些模块导入的了自己 rendermodule. js被 main. js导入
    importers = new Set() //它被哪些模块导入了

    //我这个模块可以接收哪些模块的修改
    acceptedHmrDeps = new Set() //它引入了哪些模块
    constructor(url) {
        this.url = url //url唯一标识
        this.type = 'js'
    }
}
//这是一个类记录模块关系 提供模块ID到模块节点的映射
class ModuleGraph {
    constructor(resolveId) {
        //这个就是传入的 resolveId获取绝对路径的方法
        this.resolveId = resolveId;
    }

    fileToModulesMap = new Map()
    urlToModuleMap = new Map()
    idToModuleMap = new Map()

    getModulesByFile(file) {
        return this.fileToModulesMap.get(file)
    }
    getModuleById(id) { //根据模块 id 拿到模块节点对象
        return this.idToModuleMap.get(id)
    }
    async ensureEntryFromUrl(rawUrl) {
        //获取绝对路径
        const [url, resolvedId] = await this.resolveUrl(rawUrl)
        //通过绝对路径去找对应的模块
        let mod = this.urlToModuleMap.get(resolvedId)
        if (!mod) { //没找到的情况
            mod = new ModuleNode(url) //创建一个

            this.urlToModuleMap.set(url, mod)
            //存入，key 是绝对路径，值是ModuleNode对象里面有老的路径
            this.idToModuleMap.set(resolvedId, mod)
            const file = (mod.file = resolvedId)
            let fileMappedModules = this.fileToModulesMap.get(file)
            if (!fileMappedModules) {
                fileMappedModules = new Set()
                this.fileToModulesMap.set(file, fileMappedModules)
            }
            fileMappedModules.add(mod)
        }
        return mod;
    }
    async resolveUrl(url) {
        //获取绝对地址
        const resolved = await this.resolveId(url)
        const resolvedId = resolved.id || url
        return [url, resolvedId] //存储到老路径和绝对路径
    }
    async updateModuleInfo(mod, importedModules, acceptedModules) {
        // 建立父子关系 让导入的模块imported Module，的importers包括importermodule
        for (const imported of importedModules) {
            const dep = await this.ensureEntryFromUrl(imported)
            dep.importers.add(mod)
        }
        const deps = (mod.acceptedHmrDeps = new Set())
        for (const accepted of acceptedModules) {
            const dep = await this.ensureEntryFromUrl(accepted)
            deps.add(dep)
        }
    }
}
exports.ModuleGraph = ModuleGraph;