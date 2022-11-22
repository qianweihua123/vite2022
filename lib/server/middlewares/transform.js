/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-22 14:26:55
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-22 15:32:03
 * @FilePath: /vite2022/lib/server/middlewares/transform.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const {
    isJSRequest
} = require('../../utils');
const send = require('../send');
const transformRequest = require('../transformRequest');
const {
    parse
} = require('url');

function transformMiddleware(server) {
    return async function (req, res, next) {
        debugger
        //如果请求的方法不是 get 话，直接进行下一个，这只处理 get 请求
        if (req.method !== 'GET') {
            return next()
        }
        //拿到 url 地址忽略查询参数（获取路径名 /sre/main. js?id=1 pathname=/src/main. js query=(id: 1)
        let url = parse(req.url).pathname;
        if (isJSRequest(url)) { //如果地址是 js 请求，才去处理重写第三方模块路径
            //切记这个地方要把req.url传给transformRequest，不是url,否则会丢失query
            const result = await transformRequest(req.url, server)
            //后面写的 vue 插件会依赖查询参数
            if (result) { //有结果后，然后产生一个响应
                const type = 'js'
                return send(req, res, result.code, type)
            } else {
                return next()
            }
        } else {
            return next();
        }
    }
}
module.exports = transformMiddleware