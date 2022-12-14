/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-14 21:05:34
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-22 15:30:38
 * @FilePath: /vite2022/lib/server/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const connect = require('connect')
const serveStaticMiddleware = require('./middlewares/static') //静态文件中间件
const resolveConfig = require('../config') //这是一个函数 专有函数，返回目录
const {
    createOptimizeDepsRun
} = require('../optimizer');
const transformMiddleware = require('./middlewares/transform');
const {
    createPluginContainer
} = require('./pluginContainer')

const {
    handleHMRUpdate
} = require('./hmr');
const {
    createWebSocketServer
} = require('./ws');
const {
    normalizePath
} = require('../utils');
const chokidar = require('chokidar'); //监听文件变化
const {
    ModuleGraph
} = require('./moduleGraph') //模块依赖图
const path = require('path');




async function createServer() {
    const config = await resolveConfig() //当前文件夹的目录
    const middlewares = connect() //创建一个 中间件集合 对象


    const httpServer = require('http').createServer(middlewares)
    //将 http 服务器传给 ws，实现共享
    const ws = createWebSocketServer(httpServer, config)
    //监听根目录下所有文件的变化
    const watcher = chokidar.watch(path.resolve(config.root), {
        ignored: [ //忽略
            '**/node_modules/**',
            '**/.git/**'
        ]
    });

    //创建模块依赖图
    const moduleGraph = new ModuleGraph((url) =>
        pluginContainer.resolveId(url)
    )

    //通过 config 创建一个插件容器，然后放到 server 上，
    const pluginContainer = await createPluginContainer(config) //函数返回一个 contanier 容器
    // { config对应这个目录
    //     root: process.cwd()
    // }

    //返回服务器
    const server = {
        pluginContainer, //transformRequest调用的时候会用到插件，传入 server 就能拿到了
        ws,
        watcher,
        moduleGraph,
        config,
        async listen(port, callback) {
            //在项目启动前进行依赖的预构建
            //找到本项目依赖的第三方模块
            await runOptimize(config, server)

            //当调用 listen 方法的时候，我们引入 http 模块
            //创建一个服务器
            httpServer
                .listen(port, callback) //监听我们的端口号然后回调
        }
    }
    //监听到文件发生变化后
    watcher.on('change', async (file) => {
        debugger
        //最新的变更文件
        file = normalizePath(file)
        //处理热更新
        await handleHMRUpdate(file, server)
    })

    for (const plugin of config.plugins) {
        if (plugin.configureServer) { //拿到插件后，如果插件有configureServer那就调用
            plugin.configureServer(server)
        }
    }
    //main. is中vue=>/node modules/.vite/deps /vue
    middlewares.use(transformMiddleware(server))
    middlewares.use(serveStaticMiddleware(config)) //使用静态文件中间件,传参是当前进程的根目录

    return server //返回这个服务对象
}
async function runOptimize(config, server) {
    //创建优化的依赖
    const optimizeDeps = await createOptimizeDepsRun(config) //返回一个对象
    //取出准备好的 metadata 放到 server 对象下的_optimizeDepsMetadata，存储后，
    //我们下一步重写引入的路径的时候可以去取
    ///此时把第三方模块和预编译 后的文件关联关系保存在metadata中，也保存在了_optimizeDepsMetadata
    server._optimizeDepsMetadata = optimizeDeps.metadata //对象下的metadata有元数据
}

exports.createServer = createServer