// real child process
// process.on('message', function(m){
// 	console.log('CHILD got message:', m);
// });
// process.send({
// 	foo: 'bar'
// });
// process.on('message', function(m, server){
// 	if(m === 'server'){
// 		server.on('connection',  function(socket){
// 			socket.end('handled by child, pid is ' + process.pid + '\n');
// 		});
// 	}
// })
// 改进为http
var http = require('http');
var server = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('handled by child, pid is' + process.pid + '\n');
});
// y由于tcp被发送过来，文件描述符相同，多个子进程，相同的文件描述符，可以监听相同的端口
process.on('message', function(m, tcp){
	if(m === 'server'){
		tcp.on('connection', function(socket){
			//https://github.com/nodejs/node/issues/22857
			socket.server = null;
			// 不由创建的http自动监听，而由server在tcp收到connection事件会后，提交connection事件;
			server.emit('connection', socket);
		});
	}
})

