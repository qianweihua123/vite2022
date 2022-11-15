/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-14 20:55:07
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-15 16:21:15
 * @FilePath: /vite2022/lib/cli.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// vite其实是一个服务器，我们需要启动一个服务
//第一步是让命令行可以全局使用
//从平级目录下 server 引入 createServer方法
let {
    createServer
} = require('./server');
(async function () { //如果我们新建一个测试文件，执行命令 vite2022 的时候
    //相当于执行了这个函数
    const server = await createServer();
    //监听 9999 端口
    server.listen(9999, () => {
        console.log('服务端口 9999,保存');

    });
})();

//当执行 vite2022 的时候，执行这个文件里面的内容
//这里面创建一个服务器，监听 9999 端口，我们通过 localhost:9999打开会被监听到
//当我们去创建静态服务的时候const config = await resolveConfig()执行了这个
//然后同时app.use(serveStaticMiddleware(config)) //使用静态文件中间件,传入当前启动地方的根目录，传到了静态文件中间件里面了
//所以本地访问可以获取到 index.html里面的 http://localhost:9999/index.html
//总结就是执行命令，在当前目录下启动一个服务器，找到所有的静态文件，然后可以访问
