/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-16 17:06:12
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-16 17:07:44
 * @FilePath: /vite2022/lib/optimizer/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const scanImports = require('./scan');
//分析项目依赖的第三方模块
async function createOptimizeDepsRun(config) {
    //扫描导入依赖模块
    const deps = await scanImports(config)
    console.log(deps);
}
exports.createOptimizeDepsRun = createOptimizeDepsRun;