/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-22 14:54:46
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-22 15:08:04
 * @FilePath: /vite2022/lib/plugins/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const importAnalysisPlugin = require('./importAnalysis');
const preAliasPlugin = require('./preAlias');
const definePlugin = require('./define')
const resolvePlugin = require('./resolve');
async function resolvePlugins(config, userPlugins) {
    //返回一个数组，里面是一组插件 vite 的内置插件
    return [
        preAliasPlugin(config), //把vue=>vue.js
        resolvePlugin(config),
        ...userPlugins, //用户自己的插件,
        definePlugin(config),
        importAnalysisPlugin(config)
    ]
}
exports.resolvePlugins = resolvePlugins;