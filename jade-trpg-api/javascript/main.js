var path = require('path');
var httpServer = require('./common/simpleHTTPServer');
var config     = require('./config'); 


config.globalCfg.path.appRootDir = path.resolve(__dirname);

var handlers = [];
for (moduleNames of config.globalCfg.moduleNames) {
	handlers.push(require(moduleNames).handler);
}

var server = httpServer.start(config.globalCfg, handlers, httpServer.init);

