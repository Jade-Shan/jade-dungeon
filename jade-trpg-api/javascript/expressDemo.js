var fs = require("fs");
var util = require('util');
var path = require('path');
var express = require('express');
var app = express();

// cookies
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// 创建 application/x-www-form-urlencoded 编码解析
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// 上传文件 
var multer  = require('multer');
app.use(multer({ dest: '/tmp/'}).array('image'));
 
var server = app.listen(8088, function () {
 
  var host = server.address().address;
  var port = server.address().port;
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port);
});
 
//  主页输出 "Hello World"
app.get('/', function (req, res) {
   console.log("主页 GET 请求");
   res.send('Hello GET');
});

// 下载文件
app.get('/testDownFile', function (req, res) {
   res.sendFile(path.resolve(__dirname + "/../static/image/table.jpg"));
});

// 处理get请求
app.get('/testGet', function (req, res) {
	console.log("Cookies: " + util.inspect(req.cookies));
	var response = {
		"firstName": req.query.first_name,
		"lastName" : req.query.last_name
	};
	console.log(response);
	res.send(JSON.stringify(response));
});

// 处理post请求
app.post('/testPost', urlencodedParser, function (req, res) {
	// params
	var response = {
		"firstName": req.body.first_name,
		"lastName" : req.body.last_name
	};
	// upload files
	if (req.files && req.files.length > 0) {
		req.files.forEach((file) => {
			console.log(file);  // 上传的文件信息
			var des_file = path.resolve(__dirname + "/../" + 
				req.files[0].originalname);
			fs.readFile(file.path, function (err, data) {
				fs.writeFile(des_file, data, function (err) {
					if(err) {
						console.log( err );
						response.message = "" + err;
						response.filename= file.originalname;
					} else {
						response.message = 'File uploaded successfully';
						response.filename= file.originalname;
					}
				});
			});
		});
	}
	// send response
	console.log(response);
	res.send(JSON.stringify(response));
});

app.post('/testFileUpload', function (req, res) {
	var response = {};
	if (req.files && req.files.length > 0) {
		req.files.forEach((file) => {
			console.log(file);  // 上传的文件信息
			var des_file = __dirname + "/" + req.files[0].originalname;
			fs.readFile(file.path, function (err, data) {
				fs.writeFile(des_file, data, function (err) {
					if(err) {
						console.log( err );
						response.message = "" + err;
						response.filename= file.originalname;
					} else {
						response.message = 'File uploaded successfully';
						response.filename= file.originalname;
					}
					console.log(response);
					res.end(JSON.stringify(response));
				});
			});
		});
	}
});

// 对页面 abcd, abxcd, ab123cd, 等响应 GET 请求
app.get('/ab*cd', function(req, res) {   
   console.log("/ab*cd GET 请求");
   res.send('正则匹配');
});

// 静态文件
app.use('/static', express.static('static'))
