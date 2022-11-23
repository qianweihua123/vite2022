/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-18 10:39:51
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-20 17:53:11
 * @FilePath: /vite2022/lib/server/pluginContainer.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
//插件容器方法
const {
    normalizePath
} = require("../utils");
const path = require('path');
async function createPluginContainer({
    plugins, //插件的数组，它的格式{name,resolveId}
    root //根目录
}) {
    //插件上下文
    class PluginContext {
        async resolve(id, importer = path.join(root, 'index.html')) {
            return await container.resolveId(id, importer)
        }
    }
    const container = {
        async resolveId(id, importer) {
            let ctx = new PluginContext();
            let resolveId = id;
            for (const plugin of plugins) { //遍历插件
                if (!plugin.resolveId) continue; //循环的当前项不存在 resolveId的话，那就继续循环
                //执行插件里面的 resolveId方法，拿到结果 调用插件去处理我们传入的路径第一个酒店 index.html
                const result = await plugin.resolveId.call(ctx, id, importer);
                if (result) {
                    //结果是 id 值，或者自己，值是模块的绝对路径
                    resolveId = result.id || result;
                    break;
                }
            }
            return {
                id: normalizePath(resolveId)
            }
        },

        async load(id) {
            const ctx = new PluginContext()
            //循环插件，如果插件里面提供了 load 方法，那就调用
            for (const plugin of plugins) {
                if (!plugin.load) continue
                const result = await plugin.load.call(ctx, id)
                if (result !== null) { //如果结果有值那就返回这个结果
                    return result
                }
            }
            return null
        },
        async transform(code, id) {
            for (const plugin of plugins) {
                if (!plugin.transform) continue
                const ctx = new PluginContext()
                const result = await plugin.transform.call(ctx, code, id)
                if (!result) continue
                //如果转换的结果有值就
                code = result.code || result;
            }
            //返回一个对象，有 code
            return {
                code
            }
        }

    }
    return container;
}
exports.createPluginContainer = createPluginContainer;