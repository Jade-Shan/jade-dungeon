let redis  = require('redis');
let config = require('../config');

let connMap = new Map();
config.globalCfg.redis.forEach((e) => {
    let client = redis.createClient({ host: e.host, port: e.port });
    client.on('error', (err) => console.log('Redis Client Error', err));
    connMap.set(e.name, client);
});

exports.getConn = (connName) => { return connMap.get(connName); };

exports.call = async (func) => {
    return new Promise((resolve, reject) => {
        func((err, reply) => {
				if (err) { reject(err); } else { resolve(reply); }
			});
    });
};