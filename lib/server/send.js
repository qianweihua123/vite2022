/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-22 14:33:41
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-22 14:35:14
 * @FilePath: /vite2022/lib/server/send.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const alias = {
    js: 'application/javascript',
    css: 'text/css',
    html: 'text/html',
    json: 'application/json'
}

function send(_req, res, content, type) {
    //设置响应头
    res.setHeader('Content-Type', alias[type] || type)
    //设置状态码
    res.statusCode = 200
    //返回内容
    return res.end(content)
}
module.exports = send;