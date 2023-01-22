# 基础框架


## 启动加载

* 主入口为：`javascript/main.js`
* 启动过程中加载配置文件：`javascript/config.js`

```javascript
exports.globalCfg = {
	server: {hostname : "localhost", port : 8088},
    // 多个redis数据源的配置
	redis: [{name:'trpg', host:'127.0.0.1', port:6379},
		{name:'blog', host:'127.0.0.1', port:6379},
		{name:'auth', host:'127.0.0.1', port:6379}],
	path: {
        // 为上传功能指定落地文件的位置
		uploadTmpFile : "/tmp/", 
        // 网站上静态文件（JS、图片等）的起始路径与对应的项目目录
		staticFile    : [{path : "/static", folder : "static"}],
	},
    // 各个模块，指定加载
	moduleNames : [
		"./auth/login.js",
		"./utils/weather",
		"./blog/blog",
		"./blog/gallery",
		"./sandtable/map",
		"./sandtable/dice",
		"./test"]                                // 测试模块
};
```

* HTTP服务通过包装express框架实现：`javascript/common/simpleHTTPServer.js`