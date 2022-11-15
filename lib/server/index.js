/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-14 21:05:34
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-15 15:08:41
 * @FilePath: /vite2022/lib/server/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const connect = require('connect')
async function createServer() {
    const app = connect() //创建一个 app 对象
    //返回服务器
    const server = {
        async listen(port, callback) {
            //当调用 listen 方法的时候，我们引入 http 模块
            //创建一个服务器
            require('http')
            .createServer(app)
            .listen(port, callback) //监听我们的端口号然后回调
        }
    }

    return server //返回这个服务对象
}
exports.createServer = createServer