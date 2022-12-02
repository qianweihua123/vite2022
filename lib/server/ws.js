const {
    WebSocketServer
} = require('ws');
const HMR_HEADER = 'vite-hmr'

function createWebSocketServer(httpServer) {
    //new一个服务器 websocket服务器可以和http服务器共享地址和端口。
    const wss = new WebSocketServer({
        noServer: true
    });
    //当HTTP服务器接收到客户端发出的升级协议请求的时候
    httpServer.on('upgrade', (req, socket, head) => {
        //当我们请求头是vite-hmr
        if (req.headers['sec-websocket-protocol'] === HMR_HEADER) {
            //把通信 协议从HTTP协议升级成websocket协议
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit('connection', ws, req)
            })
        }
    })
    wss.on('connection', (socket) => { //监听到连接后给客户端发送一个消息
        socket.send(JSON.stringify({
            type: 'connected'
        }))
    })
    return {
        on: wss.on.bind(wss), //通过on方法可以监听客户端发过来的请求
        off: wss.off.bind(wss), //取消监听客户端发的请求
        send(payload) { //调用此方法可以向所有的客户端发送消息
            const stringified = JSON.stringify(payload)
            wss.clients.forEach((client) => { //循环每个客户端
                if (client.readyState === 1) {
                    client.send(stringified) //调用 send 方法
                }
            })
        }
    }
}
exports.createWebSocketServer = createWebSocketServer;