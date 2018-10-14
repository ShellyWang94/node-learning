const cluster = require('cluster');
const os = require('os');
var http = require('http');
// 手动指定主进程
// 将主进程和工作进程从代码上完全剥离
// 直接实现多个子进程共享端口
cluster.setupMaster({
    exec: "cworker.js"
});
for (var i = 0; i < os.cpus().length; i++) {
        cluster.fork();
 }
 // 判断是否是主进程，依赖于环境变量中NODE_UNIQUE_ID
 // 由cluster.fork复制出来的，环境变量中存在NODE_UNIQUE_ID
if (cluster.isMaster) {
    for (var i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal){
    	console.log('worker' + worker.process.pid + 'died');
    });
}else{
	http.createServer(function(req, res){
		res.wirteHead(200);
		res.end('hello world\n')
	}).listen(8000)
}