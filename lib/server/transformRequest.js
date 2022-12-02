/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-22 14:43:07
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-22 15:50:28
 * @FilePath: /vite2022/lib/server/transformRequest.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const fs = require('fs-extra');
const {
    parse
} = require('url')
async function transformRequest(url, server) {
    // resolveld 获取 /src/main.js的绝对路径

    //transform /转换/src/main.js的内容 把vue=>vue.js
    const {
        pluginContainer //拿到 server 里面的插件容器，
    } = server
    //此处其实是调用lib/plugins/resolve.is里的resolveId方法返回绝对路径
    //第一次执行的时候是请求的 main.js文件到这一步会拿到 main.js的路径，
    const {
        id
    } = await pluginContainer.resolveId(url); //调用插件容器内的 resolvedId方法，获取此文件的绝对路径

    //1oad //读取/src/main.js的内容
    const loadResult = await pluginContainer.load(id); //加载此文件的内容
    let code;
    if (loadResult) {
        code = loadResult.code;;
    } else {
        let fsPath = parse(id).pathname;
        code = await fs.readFile(fsPath, 'utf-8')
    }


    //把每个 url 地址变成一个入口
    await server.moduleGraph.ensureEntryFromUrl(url)
    // //转换文件内容
    const transformResult = await pluginContainer.transform(code, id)
    console.log(transformResult, 'transformResult');

    return transformResult;
}
module.exports = transformRequest;