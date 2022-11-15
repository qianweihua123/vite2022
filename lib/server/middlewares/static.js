/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-15 15:49:26
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-15 15:56:21
 * @FilePath: /vite2022/lib/server/middlewares/static.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const static = require('serve-static');//serve-static是一个静态文件中中间件
function serveStaticMiddleware({ root }) {
  return static(root)//指定一个目录
}
module.exports = serveStaticMiddleware;
