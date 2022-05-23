let httpServer = require('../common/simpleHTTPServer');
let rdsUtil = require('../common/redisUtil');
const https = require('https');


let genSceneKey = (campaignId, placeId, sceneId) => {
	return `jadedungeon::sandtable::scence::${campaignId}::${placeId}::${sceneId}`;
};

let genOwnerKey = (campaignId, placeId, sceneId) => {
	return `jadedungeon::sandtable::campaignOwner::${campaignId}`;
};

exports.handler = {
	"/api/sandtable/parseImage": async (context, data) => {
		let json = { status: "error", msg: "unknow err" };
		let src = data.params.src;
		console.log(src);

		const buffers = [];
		let contenttype = '';
		let body = null;

		let request = https.get(src, (res) => {
			contenttype = res.headers['content-type'];
			if (res.statusCode !== 200) {
				console.error(`Did not get an OK from the server. Code: ${res.statusCode}`);
				context.response.writeHead(404, {
					'Content-Type': contenttype,
					'Cache-Control': 'public,s-maxage=300,max-age=300',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET,POST',
					'Access-Control-Allow-Headers': 'x-requested-with,content-type'
				});
				context.response.end('');
			}
			res.on('data', (chunk) => { buffers.push(chunk); });
			res.on('close', () => {
				body = Buffer.concat(buffers);
				// console.log('Retrieved all data');
				context.response.writeHead(200, {
					'Content-Type': contenttype,
					'Cache-Control': 'public,s-maxage=300,max-age=300',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET,POST',
					'Access-Control-Allow-Headers': 'x-requested-with,content-type'
				});
				context.response.end(body);
			});
		});
	},

	//http://localhost:8088/api/sandtable/load-map?campaignId=campaign01&placeId=place01&sceneId=scene01
	"/api/sandtable/map-owner": async (context, data) => {
		let json = {status:"error", msg: "unknow err"};
		let res = await rdsUtil.connect('trpg').call((conn, callback) => {
			conn.get(genOwnerKey(data.params.campaignId), callback);
		});
		if (res.isSuccess) {
			json.msg = 'query success';
			json.owner = res.data;
			json.status = 'success';
		}
		context.response.writeHead(200, {
			'Content-Type':'application/json;charset=utf-8',
			'Access-Control-Allow-Origin':'*',
			'Access-Control-Allow-Methods':'GET,POST',
			'Access-Control-Allow-Headers':'x-requested-with,content-type'});
		context.response.end(JSON.stringify(json));
	},

	//http://localhost:8088/api/sandtable/load-map?campaignId=campaign01&placeId=place01&sceneId=scene01
	"/api/sandtable/load-map": async (context, data) => {
		let json = {status:"error", msg: ""};
		let res = await rdsUtil.connect('trpg').call((conn, callback) => {
			conn.get(genSceneKey(data.params.campaignId, data.params.placeId, data.params.sceneId), callback);
		});
		try {
			json = JSON.parse(res.data);
			json.status = "success";
		} catch (e) {
			json = { status: "error", msg: "empty" };
		}
		context.response.writeHead(200, {
			'Content-Type':'application/json;charset=utf-8',
			'Access-Control-Allow-Origin':'*',
			'Access-Control-Allow-Methods':'GET,POST',
			'Access-Control-Allow-Headers':'x-requested-with,content-type'});
		context.response.end(JSON.stringify(json));
	},

	//http://localhost:8088/api/sandtable/save-map?campaignId=campaign01&placeId=place01&sceneId=scene01&jsonStr={} 
	"/api/sandtable/save-map": async (context, data) => {
		let result = {status:'err'};
		let res = await rdsUtil.connect('trpg').call((conn, callback) => {
			conn.get(genOwnerKey(data.params.campaignId), callback);
		});
		let owner = res.data;
		// console.log(data.params.jsonStr);
		let json = JSON.parse(data.params.jsonStr);
		if (!owner || owner.length < 1) {
			owner = json.username;
			console.log(`${owner} create capaign ${genOwnerKey(data.params.campaignId)}`);
			await rdsUtil.connect('trpg').call((conn, callback) => {
				conn.set(genOwnerKey(data.params.campaignId), owner, callback);
			});
		}
		if (owner == json.username) {
			let res = await rdsUtil.connect('trpg').call((conn, callback) => {
				conn.set(genSceneKey(data.params.campaignId, data.params.placeId, data.params.sceneId), data.params.jsonStr, callback);
			});
			if (res.data) {
				result.status = 'success';
				result.msg = 'save success';
			} else {
				result.msg = 'not owner';
			}
		} else {
			result.msg = 'not owner';
		}
		context.response.writeHead(200, {
			'Content-Type':'application/json;charset=utf-8',
			'Access-Control-Allow-Origin':'*',
			'Access-Control-Allow-Methods':'GET,POST',
			'Access-Control-Allow-Headers':'x-requested-with,content-type'});
		context.response.end(JSON.stringify(result));
	}
};
