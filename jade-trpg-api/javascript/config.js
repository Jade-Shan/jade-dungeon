exports.globalCfg = {
	server: { hostname : "localhost", port : 8088},
	redis: [{name:'trpg', host:'127.0.0.1', port:6379},
		{name:'auth', host:'127.0.0.1', port:6379}],
	path: {
		uploadTmpFile : "/tmp/",
		staticFile    : [{path : "/static", folder : "static"}],
	},
	moduleNames : [
		"./sandtable/map",
		"./test"]                                // 测试模块
};


