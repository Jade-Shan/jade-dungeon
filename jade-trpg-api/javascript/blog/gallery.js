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
    "/api/gallery/loadByUser": async (context, data) => {
        let json = {"status": "err", "page": 1, "pageCount": 0, "articles": []};
        let userId = data.params.userId;
        let page = 1;
        try {
            if (!isNaN(parseInt(data.params.page))) {
                page = parseInt(data.params.page);
            }
        } catch (error) { }
        page = page > 0 ? page : 1;
        json.page = page;
        let pageSize = 10;
        try {
            if (!isNaN(data.params.pageSize)) {
                pageSize = parseInt(data.params.pageSize);
            }
        } catch (error) { }
        pageSize = pageSize < 10 ? 10 : pageSize;
        let startIdx = (page - 1) * pageSize; 
        let endIdx = startIdx + pageSize - 1;
        endIdx = endIdx < startIdx ? startIdx : endIdx;
        if (userId && userId.length > 1) {
            let res = await rdsUtil.connect('blog').call((conn, callback) => {
                conn.llen(genGalleryKey(userId), callback);
            });
            // console.log(res);
			if (!res.isSuccess) { json.msg = res.err; } else {
                let recCount = res.data;
                if (recCount < pageSize) {
                    json.pageCount = 1;
                } else {
                    json.pageCount = parseInt((recCount + 1) / pageSize);
                }
            }
            let res2 = await rdsUtil.connect('blog').call((conn, callback) => {
                conn.lrange(genGalleryKey(userId), startIdx, startIdx + pageSize -1, callback);
            });
			if (!res2.isSuccess) { json.msg = res.err; } else {
                json.status = 'success';
                try {
                    for (let i = 0; i < res2.data.length; i++) {
                        json.articles.push(JSON.parse(res2.data[i]));
                    }
                } catch (error) { console.log(err); }
            }
            // console.log(res2);
        }
        context.response.writeHead(200, {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST',
            'Access-Control-Allow-Headers': 'x-requested-with,content-type'
        });
        context.response.end(JSON.stringify(json));
    },
    "/api/gallery/save": async (context, data) => {
        // console.log(data);
        let json = { "status": "err" };
        let time = data.params.time;
        let auth = data.params.userId;
        let title = data.params.title;
        let text = data.params.text;
        let picTitles = data.params.picTitle;
        let picDescs  = data.params.picDesc;
        let picUrls   = data.params.picUrl;
        if (picUrls && picUrls.length > 0) {
            let ablum = [];
            for (let i=0; i< picUrls.length; i++) {
                try {
                    if (picUrls[i] && picUrls[i].length > 0) {
                        ablum.push({
                            "id": i, "title": picTitles[i], "desc": picDescs[i],
                            "url": picUrls[i]
                        });
                    }
                } catch (error) { console.log(err); }
            }
            if (ablum && ablum.length > 0) {
                article = { "time": time, "auth": auth, "title": title, "text": text, "ablum": ablum };
                console.log(article);
                let res = await rdsUtil.connect('blog').call((conn, callback) => {
                    conn.lpush(genGalleryKey(auth), JSON.stringify(article), callback);
                });
                // console.log(res);
                if (!res.isSuccess) { json.msg = res.err; } else {
                    json.status = "success";
                }
            }
        }
        context.response.writeHead(200, {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST',
            'Access-Control-Allow-Headers': 'x-requested-with,content-type'
        });
        context.response.end(JSON.stringify(json));
    },
};