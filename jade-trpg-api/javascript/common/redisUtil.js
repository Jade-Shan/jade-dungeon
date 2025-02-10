let redis  = require('redis');
let config = require('../config');

let redisCfg = new Map();
let connMap = new Map();
config.globalCfg.redis.forEach(async (e) => {
	redisCfg.set(e.name, e);
	// let client = redis.createClient({ host: e.host, port: e.port });
	let client = redis.createClient({ url: `redis://${e.host}:${e.port}` });
	client.on('ready', () => console.log(`Redis Client Ready: ${e.name} by redis://${e.host}:${e.port}`));
	client.on('error', (err) => console.log(`Redis Client Error: ${e.name} by redis://${e.host}:${e.port}`, err));
	await client.connect().then(() => {
		console.log(`Redis Client connect Success: ${e.name} by redis://${e.host}:${e.port}`);
	}).catch((err) => {
		console.log(`Redis Client connect Fail: ${e.name} by redis://${e.host}:${e.port}`, err);
	});
	connMap.set(e.name, client);
});

let callRedis = async (callback) => {
    return new Promise((resolve, reject) => {
        callback((err, reply) => {
            if (err) { reject(err); } else { resolve(reply); }
        });
    });
};

exports.connect = (connName) => {
    let conn = connMap.get(connName);
    return {
        call: async (func) => {
            let resp = { isSuccess: false, data: null, err: null };
            await callRedis((callback) => {
                func(conn, callback);
            }).then((reply) => { 
                resp.isSuccess = true;
                resp.data = reply; 
            }).catch((err) => { 
                resp.err = err;
            });;
            return resp;
        }
    };
};

exports.connectV4 = (connName) => {
	let conn = connMap.get(connName);
	return {
		call: async (func) => {
			let resp = { isSuccess: false, data: null, err: null };
			await func(conn).then(reply => {
				resp.isSuccess = true;
				resp.data = reply;
			}).catch(err => {
				resp.err = err;
			})
			return resp;
		}
	};
};
