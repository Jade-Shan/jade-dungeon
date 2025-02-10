exports.globalCfg = {
	server: {hostname : "localhost", port : 8088},
	redis: [{name:'trpg', host:'127.0.0.1', port:6379},
		{name:'blog', host:'127.0.0.1', port:6379},
		{name:'auth', host:'127.0.0.1', port:6379}],
	path: {
		uploadTmpFile : "/tmp/",
		staticFile    : [{path : "/static", folder : "static"}],
	},
	moduleNames : [
		"./auth/login.js",
		"./utils/weather",
		"./blog/blog",
		"./blog/gallery",
		"./sandtable/map",
		"./sandtable/dice",
		"./test"]                                // 测试模块
};


