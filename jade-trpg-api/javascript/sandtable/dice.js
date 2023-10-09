let rdsUtil = require('../common/redisUtil');


let genRollResultKey = (campaignId, placeId, sceneId) => {
    return `jadedungeon::sandtable::rollDiceResult::${campaignId}::${placeId}::${sceneId}`;
};

let rollDice = (rollCmd) => {
    let rollArr = rollCmd.match(/(\d*d)?\d+/gi);
    // console.log(rollArr);
    let sum = 0;
    let sumStr = '';
    if (rollArr && rollArr.length > 0) {
        for (let i = 0; i < rollArr.length; i++) {
            let s = rollArr[i];
            if (/^\d+$/gi.test(s)) {
                let r = parseInt(s);
                sum = sum + r;
                sumStr = sumStr + '+' + s;
            } else if (/^1?d\d+$/i.test(s)) {
                let d = s.substring(1);
                let r = Math.floor(Math.random(parseInt()) * d) + 1;
                sum = sum + r;
                sumStr = sumStr + '+' + r + `(${s})`;
            } else if (/^\d+d\d+$/i.test(s)) {
                let n = 0;
                let ss = s.split(/d/i);
                let t = parseInt(ss[0]);
                let d = parseInt(ss[1]);
                for (let k = 0; k < t; k++) {
                    let r = Math.floor(Math.random() * d) + 1;
                    n = n + r;
                }
                sum = sum + n;
                sumStr = sumStr + '+' + n + `(${s})`;
            }
        }
        sumStr = `${sum}=` + sumStr.substring(1);
        // console.log(sumStr);
    }
    return {sum: sum, msg: sumStr};
};

exports.handler = {
    // http://localhost:8088/api/sandtable/roll-dice?campaignId=campaign01&placeId=place01&sceneId=scene01&username=jade&rollCmd=3d6+3+d4+6+7D8+9
    "/api/sandtable/roll-dice": async (context, data) => {
        let json = { status: "error", msg: "" };
        let campaignId = data.params.campaignId;
        let placeId = data.params.placeId;
        let sceneId = data.params.sceneId;
        let username = data.params.username;
        let rollCmd = data.params.rollCmd;
        if (campaignId && placeId && sceneId && username && rollCmd && //
            campaignId.length > 0 && placeId.length > 0 && sceneId.length > 0 && //
            username.length > 0 && rollCmd.length > 0) //
        {
            let threshold = 0;
            let res = await rdsUtil.connect('trpg').call((conn, callback) => {
                conn.hget(genRollResultKey(campaignId, placeId, sceneId), username, callback);
            });
            if (res.isSuccess) {
                try {
                    let rollJson = JSON.parse(res.data);
                    if (rollJson && rollJson.threshold > 0 && rollJson.sum == 0) {
                        threshold = rollJson.threshold;
                    }
                } catch (e) { console.log(e); }
            }
            if (threshold > 0) {
                let rollRes = rollDice(rollCmd);
                if (rollRes && rollRes.sum > 0) {
                    rollRes.threshold = threshold;
                    res = await rdsUtil.connect('trpg').call((conn, callback) => {
                        conn.hset(genRollResultKey(campaignId, placeId, sceneId), username,
                            JSON.stringify(rollRes), callback);
                    });
                    if (!res.isSuccess) { result.msg = res.err; } else {
                        json.status = 'success';
                        json.threshold = threshold;
                        json.msg = rollRes.msg;
                        json.sum = rollRes.sum;
                    }
                }
            } else {
                json.msg = 'not your turn';
            }
        } else { json.msg = 'miss params'; }
        context.response.writeHead(200, {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST',
            'Access-Control-Allow-Headers': 'x-requested-with,content-type'
        });
        context.response.end(JSON.stringify(json));
    },

    // http://localhost:8088/api/sandtable/set-roll-threshold?campaignId=campaign01&placeId=place01&sceneId=scene01&username=jade&threshold=33
    "/api/sandtable/set-roll-threshold": async (context, data) => {
        let json = { status: "error", msg: "" };
        let campaignId = data.params.campaignId;
        let placeId = data.params.placeId;
        let sceneId = data.params.sceneId;
        let username = data.params.username;
        let threshold = data.params.threshold;
        if (campaignId && placeId && sceneId && username && threshold && //
            campaignId.length > 0 && placeId.length > 0 && sceneId.length > 0 && //
            threshold > 0) //
        {
            let res = await rdsUtil.connect('trpg').call((conn, callback) => {
                conn.hset(genRollResultKey(campaignId, placeId, sceneId), username,
                    `{"threshold":${threshold}, "sum":0, "msg":""}`, callback);
            });
            if (!res.isSuccess) { result.msg = res.err; } else {
                json.status = 'success';
                json.data = res.data;
            }
        } else { json.msg = 'miss params'; }
        context.response.writeHead(200, {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST',
            'Access-Control-Allow-Headers': 'x-requested-with,content-type'
        });
        context.response.end(JSON.stringify(json));
    },

    // http://localhost:8088/api/sandtable/get-roll-result?campaignId=campaign01&placeId=place01&sceneId=scene01
    "/api/sandtable/get-roll-result": async (context, data) => {
		let json = {status:"error", msg: ""};
		let campaignId = data.params.campaignId;
		let placeId    = data.params.placeId   ;
		let sceneId    = data.params.sceneId   ;
		if (campaignId && placeId && sceneId && campaignId.length > 0 && 
			placeId.length > 0 && sceneId.length > 0) //
		{
			let res = await rdsUtil.connect('trpg').call((conn, callback) => {
				conn.hgetall(genRollResultKey(campaignId, placeId, sceneId), callback);
			});
			console.log(res);
			if (!res.isSuccess) { json.msg = res.err; } else {
				if (!res.isSuccess) { result.msg = res.err; } else {
					json.data = [];
					try {
						// console.log(res.data);
						for (let key in res.data) {
							try {
								//json.data[key] = JSON.parse(res.data[key]);
                                                                json.data.push({"userId": key, "threshold": rec.threshold,
                                                                          "sum":rec.sum, "msg": rec.msg });
							} catch(e) {/* do nothing */}
						}
						// json.data = null == res.data ? {} : JSON.parse(res.data);
					} catch (e) { /* */ }
				}
				json.status = 'success';
			}
		} else { json.msg = "miss params"; }
		context.response.writeHead(200, {
			'Content-Type':'application/json;charset=utf-8',
			'Access-Control-Allow-Origin':'*',
			'Access-Control-Allow-Methods':'GET,POST',
			'Access-Control-Allow-Headers':'x-requested-with,content-type'});
		context.response.end(JSON.stringify(json));
    }
}
