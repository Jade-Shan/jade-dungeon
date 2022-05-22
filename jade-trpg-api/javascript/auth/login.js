const { request } = require('express');
let jadeutils = require('../common/jadeutils');
let rdsUtil = require('../common/redisUtil');

let EXPIRE_RANGE = 1000 * 60 * 60 * 24 * 100;
let genLoginToken = (username) => {
	let uuid = jadeutils.uuid();
	let expire = Date.now() + EXPIRE_RANGE;
	return `${username}|${uuid}|${expire}`;
};
let parseLoginToken = (str) => {
	let result = {};
	if (str && str.length > 38) {
		let strArr = token.split('|');
		if (strArr.length == 3 && strArr[0].length > 0 && // 
			 strArr[1].length == 36 && strArr[2].length > 0) //
		{
			result.username = strArr[0];
			try {
				result.expire = parseInt(strArr[2]);
			} catch (err) {
				console.log(err);
			}
		}
	}
	return result;
};


let genUserInfoRrdsKey = (username) => {
	return `jadedungeon::auth::userInfo::${username}`;
};

let genUserTokenRrdsKey = (username) => {
	return `jadedungeon::auth::userAuth::${username}`;
};

exports.handler = {
	"/api/auth/regist": async (context, data) => {
		let json = { status: 'err' };
		let username = data.params.username;
		let password = data.params.password;
		if (username && password && username.length > 0 && password.length > 0) {
			let res = await rdsUtil.connect('auth').call((conn, callback) => {
				conn.get(genUserInfoRrdsKey(username), callback);
			});
			if (res && res.data && res.data.length > 0) {
				json.msg = "username exists";
				console.log(json.msg);
			} else {
				let resp = await rdsUtil.connect('auth').call((conn, callback) => {
					conn.set(genUserInfoRrdsKey(username), password, callback);
				});
				json.msg = resp.data;
				json.username = username;
				json.status = 'success';
			}
		} else {
			json.msg = "miss username or password";
		}
		context.response.writeHead(200, {
			'Content-Type': 'application/json;charset=utf-8',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,POST',
			'Access-Control-Allow-Headers': 'x-requested-with,content-type'
		});
		context.response.end(JSON.stringify(json));
	},
	"/api/auth/login": async (context, data) => {
		let json = { status: 'err' };
		let username = data.params.username;
		let password = data.params.password;
		let token = data.params.token;
		let tokenObj = parseLoginToken(token);
		if (username && password && username.length > 0 && password.length > 0) {
			let res = await rdsUtil.connect('auth').call((conn, callback) => {
				conn.get(genUserInfoRrdsKey(username), callback);
			});
			if (res && res.data && res.data == password) {
				let token = genLoginToken(username);
				let resp = await rdsUtil.connect('auth').call((conn, callback) => {
					conn.set(genUserTokenRrdsKey(username), token, callback);
				});
				json.msg = 'login success';
				json.username = username;
				json.token = token;
				json.status = 'success';
			} else {
				json.msg = "username or password err";
			}
		} else if (tokenObj.username && tokenObj.expire) {
			if (tokenObj.expire < (new Date()).getTime()) {
				json.msg = "login expire";
			} else {
				let value = await rdsUtil.connect('auth').call((conn, callback) => {
					conn.get(genUserTokenRrdsKey(username), callback);
				});
				if (value && value == token) {
					let resp = await rdsUtil.connect('auth').call((conn, callback) => {
						conn.set(genUserTokenRrdsKey(username), token, callback);
					});
					json.msg = 'login success';
					json.username = username;
					json.token = token;
					json.status = 'success';
				} else {
					json.msg = "login expire";
				}
			}
		}
		context.response.cookie("test01", "value01k", {expire: Date.now() + EXPIRE_RANGE, path: '/'});
		context.response.cookie("test02", "value02k");
		context.response.cookie("test03", "value03k");
		context.response.writeHead(200, {
			//'Set-Cookie': 'myCookie1=myValue1; Domain=localhost:8080; Expires=Fri, 26 Dec 2024 17:23:52 GMT; Path=/; HttpOnly',
			'Content-Type': 'application/json;charset=utf-8',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,POST',
			'Access-Control-Allow-Headers': 'x-requested-with,content-type'
		});
		context.response.end(JSON.stringify(json));
	}
};


