/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-14 21:05:34
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-16 17:05:44
 * @FilePath: /vite2022/lib/server/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const connect = require('connect')
const serveStaticMiddleware = require('./middlewares/static') //静态文件中间件
const resolveConfig = require('../config') //这是一个函数 专有函数，返回目录
const {
    createOptimizeDepsRun
} = require('../optimizer');

async function createServer() {
    const config = await resolveConfig() //当前文件夹的目录
    const middlewares = connect() //创建一个 中间件集合 对象
    // { config对应这个目录
    //     root: process.cwd()
    // }
    middlewares.use(serveStaticMiddleware(config)) //使用静态文件中间件,传参是当前进程的根目录
    //返回服务器
    const server = {
        async listen(port, callback) {
            //在项目启动前进行依赖的预构建
            //找到本项目依赖的第三方模块
            await runOptimize(config, server)

            //当调用 listen 方法的时候，我们引入 http 模块
            //创建一个服务器
            require('http')
                .createServer(app)
                .listen(port, callback) //监听我们的端口号然后回调
        }
    }

    return server //返回这个服务对象
}
async function runOptimize(config, server) {
    //创建优化的依赖
    await createOptimizeDepsRun(config)
}

exports.createServer = createServer