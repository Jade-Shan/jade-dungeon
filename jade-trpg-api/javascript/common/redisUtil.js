let redis  = require('redis');
let config = require('../config');

let connMap = new Map();
config.globalCfg.redis.forEach((e) => {
    let client = redis.createClient({ host: e.host, port: e.port });
    client.on('error', (err) => console.log('Redis Client Error', err));
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
            return await callRedis((callback) => {
                func(conn, callback);
            }).then((reply) => { return reply; });
        }
    };
};