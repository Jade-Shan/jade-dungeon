let httpServer = require('../common/simpleHTTPServer');
let rdsUtil = require('../common/redisUtil');
// let redis  = require('redis');

let genSceneKey = (campaignId, placeId, sceneId) => {
	return `jadedungeon::sandtable::scence::${campaignId}::${placeId}::${sceneId}`;
};

exports.handler = {
	//http://localhost:8088/api/sandtable/load-map?campaignId=campaign01&placeId=place01&sceneId=scene01
	"/api/sandtable/load-map": async (context, data) => {
		let key = genSceneKey(data.params.campaignId, data.params.placeId, data.params.sceneId);
		let jsonStr = await rdsUtil.call((callback) => {
			rdsUtil.getConn('trpg').get(key, callback);
		}).then((reply) => { return reply; });
		let json = JSON.parse(jsonStr);
		json.status = "success";
		context.response.writeHead(200, {
			'Content-Type':'application/json;charset=utf-8',
			'Access-Control-Allow-Origin':'*',
			'Access-Control-Allow-Methods':'GET,POST',
			'Access-Control-Allow-Headers':'x-requested-with,content-type'});
		context.response.end(JSON.stringify(json));
	},

	//http://localhost:8088/api/sandtable/save-map?campaignId=campaign01&placeId=place01&sceneId=scene01&jsonStr={} 
	"/api/sandtable/save-map": async (context, data) => {
		let key = genSceneKey(data.params.campaignId, data.params.placeId, data.params.sceneId);
		let resp = await rdsUtil.call((callback) => {
			rdsUtil.getConn('trpg').set(key, data.params.jsonStr, callback);
		}).then((reply) => { return reply; });
		context.response.writeHead(200, {
			'Content-Type':'application/json;charset=utf-8',
			'Access-Control-Allow-Origin':'*',
			'Access-Control-Allow-Methods':'GET,POST',
			'Access-Control-Allow-Headers':'x-requested-with,content-type'});
		context.response.end(JSON.stringify({status: "success", saveResp: resp}));
	}
};
