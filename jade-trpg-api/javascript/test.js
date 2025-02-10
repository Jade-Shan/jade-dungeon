var httpServer = require('./common/simpleHTTPServer');

exports.handler = {
	"/testGet" : async (context, data) => {
		context.response.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
		context.response.end(JSON.stringify(
			{isSuccess: true, message:"do get",  data: data}));
	},
	"/testPost": async (context, data) => {
		context.response.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
		context.response.end(JSON.stringify(
			{isSuccess: true, message:"do post", data: data}));
	},
	"/testGet2" : {method: httpServer.HTTP_GET, bindFunc: async (context, data) => {
		context.response.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
		context.response.end(JSON.stringify(
			{isSuccess: true, message:"do get2",  data: data}));
	}},
	"/testPost2": {method: httpServer.HTTP_POST, bindFunc: async (context, data) => {
		context.response.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
		context.response.end(JSON.stringify(
			{isSuccess: true, message:"do post2", data: data}));
	}}
};
