/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-15 16:03:17
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-15 16:04:32
 * @FilePath: /vite2022/lib/utils.js
 * @Description: 这是默认设
 * 置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
function normalizePath(path) {
    //保证路径分隔符变成/
    return path.replace(/\\/g, '/')
  }
  exports.normalizePath = normalizePath;