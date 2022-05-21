let httpServer = require('../common/simpleHTTPServer');
let rdsUtil = require('../common/redisUtil');

let genSceneKey = (campaignId, placeId, sceneId) => {
	return `jadedungeon::sandtable::scence::${campaignId}::${placeId}::${sceneId}`;
};

let genOwnerKey = (campaignId, placeId, sceneId) => {
	return `jadedungeon::sandtable::campaignOwner::${campaignId}`;
};

exports.handler = {
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
