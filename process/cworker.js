const http = require('http');

var server = http.createServer(function(req, res){
	res.writeHead(200, {
		'Content-Type': 'text/plain'
	});
	res.end('handled by worker' + process.pid + '\n');
});
server.listen(1337);