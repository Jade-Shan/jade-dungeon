let rdsUtil = require('../common/redisUtil');
let smp = {
    "time": 1452318852635,
    "auth": "Jade Shan",
    "title": "我在食堂学素描：第七周",
    "text": "\n",
    "ablum": [{
        "id": 7, "title": "", "desc": "", "url": "http://152.32.139.17:8081/jadeutils.v2/themes/hobbit/images/banner.png"
    }, {
        "id": 14, "title": "老师的示范", "desc": "", "url": "http://152.32.139.17:8081/jadeutils.v2/themes/hobbit/images/banner.png"
    }]
};

let genGalleryKey = (userId) => { return `jadedungeon::gallery::${userId}`; };

exports.handler = {
    "/api/gallery/save": async (context, data) => {
        // console.log(data);
        let json = { "status": "err" };
        context.response.writeHead(200, {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST',
            'Access-Control-Allow-Headers': 'x-requested-with,content-type'
        });
        context.response.end(JSON.stringify(json));
    },
};