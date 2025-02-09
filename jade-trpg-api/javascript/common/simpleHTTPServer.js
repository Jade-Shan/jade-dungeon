var fs = require("fs");
var util = require('util');
// var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
var multer  = require('multer');


var HTTP_GET  = 1;
var HTTP_POST = 2;

exports.HTTP_GET  = HTTP_GET ;
exports.HTTP_POST = HTTP_POST;

exports.init = (globalCfg, application, handlers) => {
	/* cookies */
	application.use(cookieParser());
	application.use(express.json());
	application.use(express.urlencoded({extended: false}));
	/* 上传文件 */
	if (globalCfg.path && globalCfg.path.uploadTmpFile) {
		application.use(multer({dest: globalCfg.path.uploadTmpFile}).array('uploadFiles'));
	}
	/* 绑定静态文件目录位置 */
	if (globalCfg.path && globalCfg.path.staticFile && 
		globalCfg.path.staticFile.length > 0) //
	{
		globalCfg.path.staticFile.forEach((p) => {
			application.use(p.path, express.static(p.folder));
		});
	}
	/* 创建 application/x-www-form-urlencoded 编码解析 */
	// let urlencodedParser = bodyParser.urlencoded(
	// 	{ extended: false, limit:'50mb', parameterLimit: 50000 });
		//bodyParser.json({limit: '10mb'}
	/* application context */
	let context = {
		globalCfg        : globalCfg, 
		// urlencodedParser : urlencodedParser,
		application      : application
	};
	/* bind handlers */
	if (handlers && handlers.length > 0) {
		for (handler of handlers) {
			bindHandler(context, handler);
		}
	}
};



exports.start = (globalCfg, handlers, init) => {
	var application = express();
	init(globalCfg, application, handlers);
	var server = application.listen(globalCfg.server.port, function () {
		console.log("HTTPServer Started，http://%s:%s", 
			server.address().address, server.address().port);
	});
	return {server: server, application: application};
};



var bindHandler = (context, handler) => {
	for (key in handler)  {
		let urlPtn   = "" + key;
		let method   = 1 | 2;
		let bindFunc = false;
		if (typeof handler[urlPtn] === 'function') {
			bindFunc = handler[urlPtn]; 
		} else if (typeof handler[urlPtn]   === 'object' && //
			typeof handler[urlPtn].method   === 'number' && //
			typeof handler[urlPtn].bindFunc === 'function')   //
		{
			method   = handler[urlPtn].method;
			bindFunc = handler[urlPtn].bindFunc;
		}
		// // 处理get请求
		// bindHandleWithHTTPGet( context, urlPtn, bindFunc);
		// // 处理post请求
		// bindHandleWithHTTPPost(context, urlPtn, bindFunc);
		for (m of HttpMethods) {
			if (m.method === (method & m.method)) {
				m.bindFunc(context, urlPtn, bindFunc);
			}
		}
	}  
};

var HttpMethods = [{
		method   : HTTP_GET,
		bindFunc : (context, urlPtn, bindFunc) => {
			context.application.get(urlPtn, async (request, response) => {
				context.request = request;
				context.response = response;
				//let cookies = util.inspect(request.cookies);
				let params = request.query;
				let data = {                  // data stuff
					params  : params, 
					//cookies : cookies,
					cookies : request.cookies,
					files   : []
				};
				try {
					await bindFunc(context, data);
				} catch (error) {
					console.error(error);	
				}
				if (!context.response.headersSent) {
					await context.response.writeHead(200, {
						'Content-Type': 'application/json;charset=utf-8',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET,POST',
						'Access-Control-Allow-Headers': 'x-requested-with,content-type'
					});
				}
				await context.response.end(); // end response anyway
			});
		}
	},{
		method   : HTTP_POST,
		bindFunc : (context, urlPtn, bindFunc) => {
			context.application.post(urlPtn, // context.urlencodedParser, 
				async (request, response)  => {
					context.request = request;
					context.response = response;
					//let cookies = util.inspect(request.cookies);
					let params = request.query;
					if (request.body) {
						for (f in request.body) {
							params[f] = request.body[f];
						}
					}
					// upload files
					let uploadFiles = [];
					if (request.files && request.files.length > 0) {
						uploadFiles = request.files;
					};
					let data = {              // data stuff
						params  : params, 
						cookies : request.cookies,
						//cookies : cookies,
						files   : uploadFiles 
					};
					try {
						await bindFunc(context, data);
					} catch (error) {
						console.error(error);	
					}
					if (!context.response.headersSent) {
						await context.response.writeHead(200, {
							'Content-Type': 'application/json;charset=utf-8',
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Methods': 'GET,POST',
							'Access-Control-Allow-Headers': 'x-requested-with,content-type'
						});
					}
					await context.response.end(); // end response anyway
				});
		}
	}];
