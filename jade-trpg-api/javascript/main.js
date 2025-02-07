var path = require('path');
var httpServer = require('./common/simpleHTTPServer');
var config     = require('./config'); 

// const minimist = require('minimist');
// let cmdParams = process.argv.slice(2);
// let paramMap = minimist(cmdParams);
// console.log(paramMap);

const arg = require('arg');
const args = arg({
	'--host': String, '-h': '--host',
	'--port': String, '-p': '--port',
	'--uploadPath': String, '-u': '--uploadPath',
});

console.log('host:', args['--host']);
console.log('port:', args['--port']);
console.log('uploadPath:', args['--uploadPath']);


if (args['--host']) {
	config.globalCfg.server.hostname = args['--host'];
}
if (args['--port']) {
	config.globalCfg.server.port = args['--port'];
}
if (args['--uploadPath']) {
	config.globalCfg.path.uploadTmpFile = args['--uploadPath'];
}

config.globalCfg.path.appRootDir = path.resolve(__dirname);

var handlers = [];
for (moduleNames of config.globalCfg.moduleNames) {
	handlers.push(require(moduleNames).handler);
}

var server = httpServer.start(config.globalCfg, handlers, httpServer.init);

