var fork = require('child_process').fork;
var cpus = require('os').cpus();

var server = require('net').createServer();

// 如果启动过程中报错，不断重启的状况，限制重启次数；
var limit = 20;
var during = 60000;
var restart = [];
var isTooFrequently = function(){
	var time = Date.now();
	var length = restart.push(time);
	if(length > limit){
		// 取出最后十个记录;负数为从倒数开始截取;
		restart = restart.slice(limit * -1);
	}
	// 最后一次到第一次之间时间间隔<1min
	return restart.length >= limit && (restart[restart.length -1] - restart[0] < during);
}
var workers = {};
var createWorker = function(){
	var worker = fork(__dirname + '/worker.js');
	// 判断是否太频繁,太频繁，giveup，退出，不再重启；
	if(isTooFrequently()){
		// giveup是自定义事件
		process.emit('giveup', restart.length, during);
		return ;
	}
	// 接收子进程的消息
	worker.on('message', function(msg){
		// 如归是自杀信号，立即重启
		if(msg.act === 'suicide'){
			createWorker();
		}
	});
	//检测退出
	worker.on('exit', function(){
		console.log('Worker' +  worker.pid + '.exited.');
		delete workers[worker.pid];
		// 重新创建
		// createWorker()，由于自杀信号发出，已经有新建程创建，此处就无须再创建了
	});
	worker.send('server', server);
	workers[worker.pid] = worker;
	console.log('createWorker pid' + worker.pid);
}
// 主进程退出，所有工作进程退出
process.on('exit', function(){
	for(var pid in workers){
		workers[pid].kill();
	}
});
// giveup添加监听,一旦触发giveup，就会报警
process.on('giveup', function(length, during){
	console.log('serious situation! restart too frequently! \n', length + 'restart in' + during)
	// 主进程退出
	process.exit(1);
});
server.listen(1337, function(){
	for(var i = 0; i < cpus.length; i++){
		createWorker();
	}
	// 不能关闭原连接，因为后续重启需要重新发送server过去
	// server.close(function(){
	// 	console.log('server close')
	// });	
}); 