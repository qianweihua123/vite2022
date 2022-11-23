function preAliasPlugin(config) {
    let server
    return {
        name: 'vite:pre-alias',
        configureServer(_server) {
            server = _server
        },
        //它也有 resolvedId 方法
        resolveId(id) { //把vue=>vue.js
            const metadata = server._optimizeDepsMetadata; //metaData
            const isOptimized = metadata.optimized[id]
            if (isOptimized) { //是否预编译过，有值是已经预编译过
                return {
                    id: isOptimized.file //// vue => c:/node_modules/.vite/deps/vue.js
                };
            }
        }
    }
}
module.exports = preAliasPlugin;