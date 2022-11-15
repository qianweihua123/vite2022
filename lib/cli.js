/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-14 20:55:07
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-15 15:41:04
 * @FilePath: /vite2022/lib/cli.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// vite其实是一个服务器，我们需要启动一个服务
//第一步是让命令行可以全局使用
//从平级目录下 server 引入 createServer方法
let {
    createServer
} = require('./server');
(async function () {
    const server = await createServer();
    //监听 9999 端口
    server.listen(9999, () => {
        console.log('服务端口 9999,保存');

    });
})();
