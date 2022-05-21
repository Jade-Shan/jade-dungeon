let jadeutils = require('../common/jadeutils');
let rdsUtil = require('../common/redisUtil');

let genLoginToken = () => {
	let uuid = jadeutils.uuid();
	return uuid + '-' + (new Date()).getTime();
};

let genUserInfoRrdsKey = (username) => {
	return `jadedungeon::auth::userInfo::${username}`;
};

let genUserTokenRrdsKey = (username) => {
	return `jadedungeon::auth::userAuth::${username}`;
};

exports.handler = {
	"/api/auth/register": async (context, data) => {
		let json = {status: 'err'};
		let username = data.params.username;
		let password = data.params.password;
		if (username && password && username.length > 0 && password.length > 0) {
			let key = genUserInfoRrdsKey(username);
			let jsonStr = await rdsUtil.call((callback) => {
				rdsUtil.getConn('trpg').get(key, callback);
			}).then((reply) => { return reply; });
		} else {
			json.msg = "miss username or passwork";
		}
		context.response.writeHead(200, {
			'Content-Type':'application/json;charset=utf-8',
			'Access-Control-Allow-Origin':'*',
			'Access-Control-Allow-Methods':'GET,POST',
			'Access-Control-Allow-Headers':'x-requested-with,content-type'});
		context.response.end(JSON.stringify(json));
	},
	"/api/auth/login": async (context, data) => {
		context.response.writeHead(200, {
			'Content-Type':'application/json;charset=utf-8',
			'Access-Control-Allow-Origin':'*',
			'Access-Control-Allow-Methods':'GET,POST',
			'Access-Control-Allow-Headers':'x-requested-with,content-type'});
		context.response.end(JSON.stringify(json));
	}
};

