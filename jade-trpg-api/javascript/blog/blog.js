// const { sample } = require('lodash');
let rdsUtil = require('../common/redisUtil');

let genBlogKey = (userId) => { return `jadedungeon::blog::${userId}`; };

exports.handler = {
	// http://localhost:8088/api/blog/loadByUser?userId=u001&page=1&pageSize=10 
    "/api/blog/loadUserById": async (context, data) => {
		if (!context.response.headersSent) {
			await context.response.writeHead(200, {
				'Content-Type': 'application/json;charset=utf-8',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET,POST',
				'Access-Control-Allow-Headers': 'x-requested-with,content-type'
			});
		}
		context.response.end(JSON.stringify({
			"status": "success", "user": {
				"userName": "Jade Shan",
				"avatar": "http://152.32.139.17:8081/jadeutils.v2/themes/hobbit/images/atc-01.jpg",
				"desc": "Demo post with formatted elements and comments.",
				"joinTime": "2021-03-21",
				"group": "Primer",
				"homePageUrl": "#"
			}
		}));
    },
    "/api/blog/loadRecommandArticles": async (context, data) => {
		if (!context.response.headersSent) {
			await context.response.writeHead(200, {
				'Content-Type': 'application/json;charset=utf-8',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET,POST',
				'Access-Control-Allow-Headers': 'x-requested-with,content-type'
			});
		}
		await context.response.end(JSON.stringify({
				"status": "success", "recommands": [{
					"title": "Demo post with formatted elements and comments",
					"thumbnail": "http://152.32.139.17:8081/jadeutils.v2/themes/hobbit/images/atc-01.jpg",
					"link": "#"
				}, {
					"title": "Images in this template",
					"thumbnail": "http://152.32.139.17:8081/jadeutils.v2/themes/hobbit/images/atc-02.jpg",
					"link": "#"
				}]
			}));
    },
    "/api/blog/loadByUser": async (context, data) => {
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
            let res = await rdsUtil.connectV4('blog').call((conn) => {
                return conn.lLen(genBlogKey(userId));
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
            let res2 = await rdsUtil.connectV4('blog').call((conn) => {
                return conn.lRange(genBlogKey(userId), startIdx, startIdx + pageSize -1);
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
		if (!context.response.headersSent) {
			await context.response.writeHead(200, {
				'Content-Type': 'application/json;charset=utf-8',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET,POST',
				'Access-Control-Allow-Headers': 'x-requested-with,content-type'
			});
		}
		await context.response.write(JSON.stringify(json));
    },
    "/api/blog/save": async (context, data) => {
        let now    = (new Date()).getTime();
        let json = {"status": "err"};
        let userId = data.params.userId;
        let text   = data.params.text;
        let time   = now;
        try {
            if (!isNaN(parseInt(data.params.time))) {
                time = parseInt(data.params.time);
            }
        } catch (error) { }
        if (NaN == time) { time = now; }
        let title  = data.params.title && data.params.title.length > 0 ? //
            data.params.title : `New Article ${now}`;
        if (userId && userId.length > 1 && text && text.length > 0) {
            let res = await rdsUtil.connectV4('blog').call((conn) => {
                return conn.lPush(genBlogKey(userId), JSON.stringify({
                    "time": time, "auth": userId, "title": title, "text": text
                }));
            });
            // console.log(res);
			if (!res.isSuccess) { json.msg = res.err; } else {
                json.status = "success";
            }
        }
		if (!context.response.headersSent) {
			await context.response.writeHead(200, {
				'Content-Type': 'application/json;charset=utf-8',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET,POST',
				'Access-Control-Allow-Headers': 'x-requested-with,content-type'
			});
		}
		await context.response.send(JSON.stringify(json));
    },
};
