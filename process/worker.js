var http = require('http');
var server = http.createServer(function(req, res){
	console.log('child');
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('handled by child, pid is ' + process.pid + '\n');
	// 模拟异常-一旦有请求，抛出异常
	throw new Error('throw exception');
});
var worker;
process.on('message', function(m, tcp){
	if(m === 'server'){
		tcp.on('connection', function(socket){
			//https://github.com/nodejs/node/issues/22857
			socket.server = null;
			// 不由创建的http自动监听，而由server在tcp收到connection事件会后，提交connection事件;
			server.emit('connection', socket);
		});
	}
});
//对某个进程异常事件的监听
process.on('uncaughtException', function(err){
	// 记录下错误和进程id
	console.log(err, process.pid);
	// 一旦发生异常，向主进程发送suicide信号
	process.send({act: 'suicide'});
	//停止接受新连接
	if(worker){
			// 如果是长连接，等待断开会等待很久，设置超时时间 
			worker.close(function(){
			// 所有连接都断开后，退出进程;有可能会造成全部进程在等待，丢掉大部分请求-添加自杀信号
			// 触发主进程上exit事件，会重新创建新进程
			process.exit(1);
			// 5s连接未断开，强行退出
			setTimeout(function(){
				process.exit(1);
			}, 5000)
		})
	}
})