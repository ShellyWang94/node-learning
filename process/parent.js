// var cp = require('child_process');
// // return spawn child process -> in fact is parent;
// var n = cp.fork(__dirname + '/sub.js');

// n.on('message', function(m){
// 	console.log('PARENT got message:', m);
// });

// // 向真正的子进程发送消息
// n.send({hello: 'world'});
const cp = require('child_process');
var child1 = cp.fork('./sub.js');
var child2 = cp.fork('./sub.js');

var server = require('net').createServer();
// 去掉主进程对连接的监听
// server.on('connection', function(socket){
// 	socket.end('handled by parent');
// });
server.listen(1337, function(){
	// 发送的不是对象，句柄fd+msg的字符串
	// 只有一个进程能收到请求，文件描述符同一时间只能被某个进程使用，抢占式的
	child1.send('server', server);
	child2.send('server', server);
	// 添加发送服务器句柄之后，关掉服务器的监听，由子进程来完全处理请求
	server.close();
});

// 使用kill给进程发送退出信号
// process.on('SIGTERM', function(){
// 	console.log('Got a SIGTERM, exiting...');
// 	process.exit(1);
// });

// console.log('server running with PID:', process.pid);
// process.kill(process.pid, 'SIGTERM');