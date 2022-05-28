/* jshint esversion: 8 */
let cookieOperator = (name, value, options) => {
		if (typeof value != 'undefined') {
			options = options || {};
			if (value === null) {
				value = '';
				options.expires = -1;
			}
			var expires = '';
			if (options.expires &&
					(typeof options.expires == 'number' || options.expires.toUTCString))
			{
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() +
							(options.expires * 24 * 60 * 60 * 1000));
				} else {
					date = options.expires;
				}
				expires = ';expires=' + date.toUTCString();
			}
			var path = options.path ? ';path=' + options.path : '';
			var domain = options.domain ? ';domain=' + options.domain : '';
			var secure = options.secure ? ';secure' : '';
			var sameSite = options.SameSite ? ';SameSite=' + options.SameSite : '';
			let concatStr = [ name, '=', encodeURIComponent(value), expires,
					path, domain, sameSite, secure ].join('');
			console.log(concatStr);
			document.cookie = concatStr;
		} else {
			var cookieValue = null;
			if (document.cookie && document.cookie !== '') {
				var cookies = document.cookie.split(';');
				for ( var i = 0; i < cookies.length; i++) {
					var cookie = cookies[i].trim();
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie
								.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	};

function parseUrlParams() {
	let params = new Map();
	if (document.location.search.length > 1) {
		let paramStr = document.location.search.substring(1);
		let strArr   = paramStr.split('&');
		for (let i = 0; i < strArr.length; i++) {
			let kvArr = strArr[i].split('=');
			let key   = decodeURIComponent(kvArr[0]);
			let value = decodeURIComponent(kvArr[1]);
			if (params.has(key)) {
				let oldValue = params.get(key);
				if (oldValue instanceof Array) {
					oldValue.push(value);
				} else {
					params.set(key, [oldValue, value]);
				}
			} else {
				params.set(key, value);
			}
		}
	}
	return params;
}

let defaultImgData = 'data:image/jpeg;base64,' +
	'/9j/4AAQSkZJRgABAQEASABIAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc' +
	'4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2' +
	'NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAyADIDAREAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAQCAwUB/' +
	'8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB3CoiXnTp0iZJYIEjcLSIuXFIuaJ0gJmeMjY0BEQECRpD' +
	'YHCozRkaLQAAAAA//8QAIBAAAgICAgIDAAAAAAAAAAAAAgMAARESBBATIBQhMP/aAAgBAQABBQKGwAi3AyZmfR1IAkD' +
	'HCZkKjqLvI9MELlQ6BsXxAGVWOrlrzd/J20bAbt6ctRtAuIeF02lrr67YOw+F1ylFUEcfl//EABQRAQAAAAAAAAAAAA' +
	'AAAAAAAFD/2gAIAQMBAT8BR//EABQRAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQIBAT8BR//EACQQAAEDBAEDBQAAAAAAA' +
	'AAAAAEAAhEDEiAiECEwMUFRYYGR/9oACAEBAAY/Als6FqcpqeSpZ4UvdaFNKvchzvwWOxvLoPp8LV4V9RwuHtiAwrVo' +
	'/VFX6x6GFtVMKJ7f/8QAIBABAAICAgIDAQAAAAAAAAAAAQARITEQUSBhMEFxgf/aAAgBAQABPyGC4osc9SptOF85yP8' +
	'ASELu9k31VCyrxGy4jnfIIAfXcAGNQyg+onen6RgCjhULGfDIZt33e4VBGkgsKp8AeFORdwu77HHl1DswgUeCsWO4ur' +
	'8SAGQ+Mf/aAAwDAQACAAMAAAAQkkkgEEEEgAgEEggEAkEEEAAAn//EABQRAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQMBA' +
	'T8QR//EABQRAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQIBAT8QR//EACEQAQACAgICAgMAAAAAAAAAAAEAESFBEDFRYSCh' +
	'gZHR/9oACAEBAAE/EOiWr1a5jXtWKigBL1b3C3SMLcvLT9o/kF1zF1M2HJKCGADILfUUMUZrzwwkAuFtAQABgh1KF27' +
	'PcBERbSP3AAUHFCFoRshUeovIE8dfhE5nBas2LuI2cBxLiWTKBWkBOoiFCP3KJmwGUyDua4I8TSNM9uhtMRg2r2yick' +
	'18N8f/2Q==';

let loadImage = async (image, url) => {
	// console.log(url);
	if (url.indexOf('http') == 0) {
		let encodeSrc = encodeURIComponent(url);
		url = 'http://localhost:8088/api/sandtable/parseImage?src=' + encodeSrc;
	}
	let pm = new Promise((resolve, reject) => {
		image.src = url;
		image.crossOrigin='Anonymous';
		// image.crossorigin='anonymous';
		// image.crossOrigin = "anonymous";
		// image.setAttribute('crossOrigin', 'anonymous');
		// image.setAttribute('crossorigin', 'anonymous');
		image.onload  = () => { resolve(image, url); };
		image.onabort = () => { reject (image, url); };
		image.onerror = () => { reject (image, url); };
	});
	return await pm.then((image, url) => { return image; }).catch(async (image, url) => {
		console.log(`load image err: ${url}`);
		image.src = defaultImgData;
		image.crossOrigin='Anonymous';
		let errPm = new Promise((resolve, reject) => {
			// image.crossorigin='anonymous';
			// image.crossOrigin = "anonymous";
			// image.setAttribute('crossOrigin', 'anonymous');
			// image.setAttribute('crossorigin', 'anonymous');
			image.onload  = () => { resolve(image, url); };
			image.onabort = () => { reject (image, url); };
			image.onerror = () => { reject (image, url); };
		});
		return await errPm.then((image, url) => { return image; }).catch(
			(image, url) => { return null; }
		);
	});
};

let sleepMS = async (ms) =>  {
	return new Promise((resolve, reject) => {
		setTimeout(() => { resolve(); }, ms);
	});
};

let tokenToData = (token) => {
	let rec = {"id": token.id};
	if ("Image" != token.classType) {
		rec.x         = token.x         ;
		rec.y         = token.y         ;
		rec.visiable  = token.visiable  ;
		rec.blockView = token.blockView ;
		rec.color     = token.color     ;
		if ("canvas.shape.2d.Rectangle" == token.classType || 
			"canvas.shape.2d.Circle" == token.classType) //
		{
			rec.img = {
				"imgKey" : token.image.key   ,
				"sx"     : token.image.sx    ,
				"sy"     : token.image.sy    ,
				"width"  : token.image.width ,
				"height" : token.image.height,
			};
		}
	} 
	if ("canvas.shape.2d.Line" == token.classType) {
		rec.type       = "Line"         ;
		rec.x2         = token.x2       ;
		rec.y2         = token.y2       ;
	} else if ("canvas.shape.2d.Rectangle" == token.classType) {
		rec.type       = "Rectangle"    ;
		rec.width  = token.width ;
		rec.height = token.height;
	} else if ("canvas.shape.2d.Circle" == token.classType) {
		rec.type   = "Circle"    ;
		rec.radius =  token.radius;
	} else if ("Image" == token.classType) {
		rec.type   = "Image"    ;
		rec.url = token.url;
	}
	return rec;
};

let dataToToken = async (ctx, scene, rec) => {
	if (rec && rec.id) {
		let tkImg = {};
		if ('Image' != rec.type && rec.img && rec.img.imgKey) { 
			tkImg.key = rec.img.imgKey; 
			if (scene.imageMap.has(rec.img.imgKey)) {
				tkImg.img = scene.imageMap.get(rec.img.imgKey).image.img; 
				if (rec.img && rec.img.sx    ) { tkImg.sx     = rec.img.sx    ; }
				if (rec.img && rec.img.sy    ) { tkImg.sy     = rec.img.sy    ; }
				if (rec.img && rec.img.width ) { tkImg.width  = rec.img.width ; }
				if (rec.img && rec.img.height) { tkImg.height = rec.img.height; }
			}
		}
		if ('Line' === rec.type) {
			return new Line(ctx, rec.id, rec.x, rec.y, rec.x2, rec.y2, rec.color, rec.visiable, rec.blockView);
		} else if ('Rectangle' === rec.type) {
			return new Rectangle(ctx, rec.id, rec.x, rec.y, rec.width, rec.height, 
				rec.color, tkImg, rec.visiable, rec.blockView);
		} else if ('Circle' === rec.type) {
			return new Circle(ctx, rec.id, rec.x, rec.y, rec.radius, 
				rec.color, tkImg, rec.visiable, rec.blockView);
		} else if ('Image' === rec.type) {
			let img = await loadImage(new Image(), rec.url);
			return {classType: "Image", id: rec.id, url: rec.url,
				x:0, y:0, width: img.width, height: img.height,
				image: {key: rec.id, sx:0, sy: 0, width: img.width, height: img.height, img: img}};
		}
	}
};

let seriseTokenMap = (itemMap) => {
	let items = [];
	if (itemMap) {
		for (let e of itemMap) {
			items.push(tokenToData(e[1]));
		}
	}
	return items;
};

let loadItemsOnMap = async (ctx, scene, itemList, itemMap, itemDatas) => {
	if (itemDatas) {
		for (let i = 0; i < itemDatas.length; i++) {
			let obj = await dataToToken(ctx, scene, itemDatas[i]);
			if (obj) { 
				itemList.push(obj); 
				itemMap.set(obj.id, obj);
			}
		}
	}
};

let loadMoveRequest = async (campaignId, placeId, sceneId) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: apiRoot + 'load-move-request?campaignId=' + encodeURIComponent(campaignId) + 
				'&placeId=' + encodeURIComponent(placeId) + '&sceneId='+ encodeURIComponent(sceneId) +
				'&t=' + (new Date()).getTime(), 
			type: 'GET', dataType: 'json', data: { }, timeout: 30000, 
			xhrFields: {'Access-Control-Allow-Origin':'*'}, 
			success: function(data, status, xhr) {
				if ('success' == data.status) { // console.log(data);
					resolve(data);
				} else { reject(data); }
			},
			error: function(xhr, errorType, error) { reject(xhr); },
			complete: function(xhr, status) { }
		});
	});
};

let requestMoveTo = async (campaignId, placeId, sceneId, username, x, y) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: apiRoot + 'request-move?campaignId=' + encodeURIComponent(campaignId) + 
				'&placeId=' + encodeURIComponent(placeId) + '&sceneId='+ encodeURIComponent(sceneId) +
				'&username=' + encodeURIComponent(username) + '&x=' + encodeURIComponent(x) + 
				'&y=' + encodeURIComponent(y) + '&t=' + (new Date()).getTime(), 
			type: 'GET', dataType: 'json', data: { }, timeout: 30000, 
			xhrFields: {'Access-Control-Allow-Origin':'*'}, 
			success: function(data, status, xhr) {
				if ('success' == data.status) { // console.log(data);
					resolve(data);
				} else { reject(data); }
			},
			error: function(xhr, errorType, error) { reject(xhr); },
			complete: function(xhr, status) { }
		});
	});
};

let rollDice = async (campaignId, placeId, sceneId, username, rollCmd) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: apiRoot + 'roll-dice?campaignId=' + encodeURIComponent(campaignId) + 
				'&placeId=' + encodeURIComponent(placeId) + '&sceneId='+ encodeURIComponent(sceneId) +
				'&username=' + encodeURIComponent(username) + '&rollCmd='+ encodeURIComponent(rollCmd) +
				'&t=' + (new Date()).getTime(), 
			type: 'GET', dataType: 'json', data: { }, timeout: 30000, 
			xhrFields: {'Access-Control-Allow-Origin':'*'}, 
			success: function(data, status, xhr) {
				if ('success' == data.status) { // console.log(data);
					resolve(data);
				} else { reject(data); }
			},
			error: function(xhr, errorType, error) { reject(xhr); },
			complete: function(xhr, status) { }
		});
	});
};

let queryRollResult = async (campaignId, placeId, sceneId) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: apiRoot + 'get-roll-result?campaignId=' + encodeURIComponent(campaignId) + 
				'&placeId=' + encodeURIComponent(placeId) + '&sceneId='+ encodeURIComponent(sceneId) +
				'&t=' + (new Date()).getTime(), 
			type: 'GET', dataType: 'json', data: { }, timeout: 30000, 
			xhrFields: {'Access-Control-Allow-Origin':'*'}, 
			success: function(data, status, xhr) {
				if ('success' == data.status) { // console.log(data);
					resolve(data);
				} else { reject(data); }
			},
			error: function(xhr, errorType, error) { reject(xhr); },
			complete: function(xhr, status) { }
		});
	});
};

let requestRollThreshold = async (campaignId, placeId, sceneId, username, threshold) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: apiRoot + 'set-roll-threshold?campaignId=' + encodeURIComponent(campaignId) + 
				'&placeId=' + encodeURIComponent(placeId) + '&sceneId='+ encodeURIComponent(sceneId) +
				'&username=' + encodeURIComponent(username) + '&threshold=' + encodeURIComponent(threshold) + 
				'&t=' + (new Date()).getTime(), 
			type: 'GET', dataType: 'json', data: { }, timeout: 30000, 
			xhrFields: {'Access-Control-Allow-Origin':'*'}, 
			success: function(data, status, xhr) {
				if ('success' == data.status) { // console.log(data);
					resolve(data);
				} else { reject(data); }
			},
			error: function(xhr, errorType, error) { reject(xhr); },
			complete: function(xhr, status) { }
		});
	});
};

let requestMapDatas = async (campaignId, placeId, sceneId) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: apiRoot + 'load-map?campaignId=' + encodeURIComponent(campaignId) + 
				'&placeId=' + encodeURIComponent(placeId) + '&sceneId='+ encodeURIComponent(sceneId) +
				"&t=" + (new Date()).getTime(), 
			type: 'GET', dataType: 'json', data: { }, timeout: 30000, 
			xhrFields: {'Access-Control-Allow-Origin':'*'}, 
			success: function(data, status, xhr) {
				if ('success' == data.status) { // console.log(data);
					resolve(data);
				} else { reject(data); }
			},
			error: function(xhr, errorType, error) { reject(xhr); },
			complete: function(xhr, status) { }
		});
	});
};

let queryCampaignOwner = async (campaignId) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: apiRoot + 'map-owner?campaignId=' + encodeURIComponent(campaignId) + 
				"&t=" + (new Date()).getTime(), 
			type: 'GET', dataType: 'json', data: { }, timeout: 30000, 
			xhrFields: {'Access-Control-Allow-Origin':'*'}, 
			success: function(data, status, xhr) {
				if ('success' == data.status) { // console.log(data);
					resolve(data);
				} else { reject(data); }
			},
			error: function(xhr, errorType, error) { reject(xhr); },
			complete: function(xhr, status) { }
		});
	});
};

let updateMapDatas = async (campaignId, placeId, sceneId, jsonStr) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: apiRoot + 'save-map?campaignId=' + encodeURIComponent(campaignId) + 
				'&placeId=' + encodeURIComponent(placeId) + '&sceneId='+ encodeURIComponent(sceneId) +
				"&t=" + (new Date()).getTime(), 
			type: 'POST', dataType: 'json', data: {jsonStr: jsonStr}, timeout: 30000,
			xhrFields: {'Access-Control-Allow-Origin':'*'}, 
			success: function(data, status, xhr) {
				if ('success' == data.status) { // console.log(data);
					resolve(data);
				} else { reject(data); }
			},
			error: function(xhr, errorType, error) { reject(xhr); },
			complete: function(xhr, status) { }
		});
	});
};

function initTestMapData() {
let jsonStr = JSON.stringify(testData);
	updateMapDatas('campaign01', 'place01', 'scene01', jsonStr).then((d) => { /* console.log(d); */ });
}
let testData = {
	"status": "success", 
	"imgResources": [
	{"id":"chrt"        , "type":"Image", "url": "./images/sandtable/char.png"        },
	{"id":"sdr1"        , "type":"Image", "url": "./images/sandtable/solider01.png"   },
	{"id":"mos1"        , "type":"Image", "url": "./images/sandtable/moster.01.png"   },
	{"id":"mos2"        , "type":"Image", "url": "./images/sandtable/moster.02.png"   },
	{"id":"door"        , "type":"Image", "url": "./images/sandtable/door-wood.png"   },
	{"id":"trsuBox-01-c", "type":"Image", "url": "./images/sandtable/trsuBox-01-c.png"},
	{"id":"trsuBox-02-c", "type":"Image", "url": "./images/sandtable/trsuBox-02-c.png"},
	{"id":"map"         , "type":"Image", "url": "./images/sandtable/map.png"         }],
	"mapDatas" : {
		"teams": [
		{"id": "u001", "type":"Circle", "x":250, "y":300, "radius":25, "color":"#0000FF", "img":{"imgKey":"chrt", "sx":0, "sy":0, "width":50, "height":50}, "visiable":  true, "blockView":  false},
		{"id": "Teo" , "type":"Circle", "x":300, "y":200, "radius":25, "color":"#0000FF", "img":{"imgKey":"sdr1", "sx":0, "sy":0, "width":50, "height":50}, "visiable":  true, "blockView":  true },
		{"id": "Leo" , "type":"Circle", "x":400, "y":300, "radius":25, "color":"#0000FF", "img":{"imgKey":"sdr1", "sx":0, "sy":0, "width":50, "height":50}, "visiable":  true, "blockView":  true }],
		"creaters": [
		{"id":"Orc01", "type":"Circle", "x":350, "y":350, "radius":25, "color":"#FF0000", "img":{"imgKey":"mos1", "sx":0, "sy":0, "width": 50, "height":50}, "visiable":  true, "blockView":  true},
		{"id":"Orc02", "type":"Circle", "x":650, "y":400, "radius":25, "color":"#FF0000", "img":{"imgKey":"mos1", "sx":0, "sy":0, "width": 50, "height":50}, "visiable":  true, "blockView":  true},
		{"id":"Orc03", "type":"Circle", "x":600, "y":500, "radius":25, "color":"#FF0000", "img":{"imgKey":"mos1", "sx":0, "sy":0, "width": 50, "height":50}, "visiable":  true, "blockView":  true},
		{"id":"Bhd01", "type":"Circle", "x":150, "y":550, "radius":50, "color":"#FF0000", "img":{"imgKey":"mos2", "sx":0, "sy":0, "width":100, "height":100}, "visiable":  true, "blockView":  true},
		{"id":"Bhd02", "type":"Circle", "x":450, "y":550, "radius":50, "color":"#FF0000", "img":{"imgKey":"mos2", "sx":0, "sy":0, "width":100, "height":100}, "visiable":  true, "blockView":  true},
		{"id":"Bhd03", "type":"Circle", "x":900, "y":600, "radius":50, "color":"#FF0000", "img":{"imgKey":"mos2", "sx":0, "sy":0, "width":100, "height":100}, "visiable":  true, "blockView":  true}],
		"furnishings": [
		{"id":"trsubox01", "type":"Rectangle", "x": 150, "y": 600, "width":50, "height": 50, "color":"#FF0000", "img":{"imgKey":"trsuBox-01-c", "sx":0, "sy":0, "width": 50, "height":50}, "visiable":  true, "blockView":  true},
		{"id":"trsubox02", "type":"Rectangle", "x": 200, "y": 600, "width":50, "height": 50, "color":"#FF0000", "img":{"imgKey":"trsuBox-02-c", "sx":0, "sy":0, "width": 50, "height":50}, "visiable":  true, "blockView":  true}],
		"doors": [
		{"id":"door01", "type":"Rectangle", "x": 150, "y": 440, "width":100, "height": 15, "color":"#FF0000", "img":{"imgKey":"door", "sx":0, "sy":0, "width":100, "height":15}, "visiable": false, "blockView": false},
		{"id":"door02", "type":"Rectangle", "x": 250, "y": 440, "width":100, "height": 15, "color":"#FF0000", "img":{"imgKey":"door", "sx":0, "sy":0, "width":100, "height":15}, "visiable":  true, "blockView":  true}],
		"walls": [
		{"id":"wall-000", "type":"Line", "x":   0, "y": 350, "x2": 100, "y2":  350, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-001", "type":"Line", "x": 100, "y": 350, "x2": 100, "y2":  150, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-002", "type":"Line", "x": 100, "y": 150, "x2": 250, "y2":  150, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-003", "type":"Line", "x": 250, "y": 150, "x2": 250, "y2":   50, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-004", "type":"Line", "x": 250, "y":  50, "x2": 350, "y2":   50, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-005", "type":"Line", "x": 350, "y":  50, "x2": 350, "y2":    0, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-006", "type":"Line", "x": 450, "y":   0, "x2": 450, "y2":   50, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-007", "type":"Line", "x": 450, "y":  50, "x2": 550, "y2":   50, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-008", "type":"Line", "x": 550, "y":  50, "x2": 550, "y2":  150, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-009", "type":"Line", "x": 550, "y": 150, "x2": 850, "y2":  150, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-010", "type":"Line", "x": 850, "y": 150, "x2": 850, "y2":   50, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-011", "type":"Line", "x": 850, "y":  50, "x2":1150, "y2":   50, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-012", "type":"Line", "x":1150, "y":  50, "x2":1150, "y2":    0, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-013", "type":"Line", "x":1250, "y":   0, "x2":1250, "y2":   50, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-014", "type":"Line", "x":1250, "y":  50, "x2":1500, "y2":  250, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-015", "type":"Line", "x":1500, "y": 250, "x2":1550, "y2":  250, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-016", "type":"Line", "x":1550, "y": 250, "x2":1550, "y2":  350, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-017", "type":"Line", "x":1550, "y": 350, "x2":1600, "y2":  350, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-018", "type":"Line", "x": 550, "y": 250, "x2": 550, "y2":  300, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-019", "type":"Line", "x":   0, "y": 450, "x2": 150, "y2":  450, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-020", "type":"Line", "x":  50, "y": 450, "x2":  50, "y2":  650, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-021", "type":"Line", "x":  50, "y": 650, "x2": 250, "y2":  650, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-022", "type":"Line", "x": 350, "y": 450, "x2": 550, "y2":  450, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-023", "type":"Line", "x": 250, "y": 450, "x2": 250, "y2":  750, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-024", "type":"Line", "x": 250, "y": 750, "x2": 850, "y2":  750, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-025", "type":"Line", "x": 550, "y": 650, "x2": 550, "y2":  750, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-026", "type":"Line", "x": 550, "y": 350, "x2": 550, "y2":  450, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-027", "type":"Line", "x": 550, "y": 350, "x2": 750, "y2":  350, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-028", "type":"Line", "x": 550, "y": 550, "x2": 750, "y2":  550, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-029", "type":"Line", "x": 550, "y": 650, "x2": 750, "y2":  650, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-030", "type":"Line", "x": 750, "y": 450, "x2": 750, "y2":  550, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-031", "type":"Line", "x": 750, "y": 650, "x2": 750, "y2":  750, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-032", "type":"Line", "x":1050, "y": 650, "x2":1050, "y2":  750, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-033", "type":"Line", "x": 750, "y": 450, "x2":1050, "y2":  450, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-034", "type":"Line", "x": 750, "y": 750, "x2":1050, "y2":  750, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-035", "type":"Line", "x":1050, "y": 450, "x2":1050, "y2":  550, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-036", "type":"Line", "x":1150, "y": 450, "x2":1250, "y2":  450, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-037", "type":"Line", "x":1050, "y": 650, "x2":1250, "y2":  650, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-038", "type":"Line", "x":1250, "y": 550, "x2":1350, "y2":  550, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-039", "type":"Line", "x":1250, "y": 400, "x2":1250, "y2":  750, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-040", "type":"Line", "x":1250, "y": 750, "x2":1450, "y2":  750, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-041", "type":"Line", "x":1450, "y": 750, "x2":1450, "y2":  550, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-042", "type":"Line", "x":1450, "y": 550, "x2":1550, "y2":  450, "color": "#00FF00", "visiable": false, "blockView":  true},
		{"id":"wall-043", "type":"Line", "x":1550, "y": 450, "x2":1600, "y2":  450, "color": "#00FF00", "visiable": false, "blockView":  true}]}
};

let loadMapDatas = async (ctx, scene) => {
	await requestMapDatas(scene.campaignId, scene.placeId, scene.sceneId).then((data) => { 
		// console.log(JSON.stringify(data));
		imgResources = data.imgResources;
		mapDatas     = data.mapDatas;
	}).catch((e) => {
		imgResources = [
			{"id":"default","type":"Image","url":"./images/sandtable/default.jpg"},
			{"id":"icons","type":"Image","url":"./images/sandtable/icons.jpg"},
			{"id":"map","type":"Image","url":"./images/sandtable/map.jpg"}];
		mapDatas     = {"teams": [{"id": "default", "type":"Circle", 
			"x":250, "y":300, "radius":25, "color":"#0000FF", 
			"img":{"imgKey":"default", "sx":100, "sy":100, "width":50, "height":50}, 
			"visiable":  false, "blockView":  false}], 
			"creaters": [], "furnishings": [], "doors": [], "walls": []};
	});	
	await loadItemsOnMap(ctx, scene, scene.images,      scene.imageMap,      imgResources        );
	await loadItemsOnMap(ctx, scene, scene.walls,       scene.wallMap,       mapDatas.walls      );
	await loadItemsOnMap(ctx, scene, scene.doors,       scene.doorMap,       mapDatas.doors      );
	await loadItemsOnMap(ctx, scene, scene.furnishings, scene.furnishingMap, mapDatas.furnishings);
	await loadItemsOnMap(ctx, scene, scene.creaters,    scene.createrMap,    mapDatas.creaters   );
	await loadItemsOnMap(ctx, scene, scene.teams,       scene.teamMap,       mapDatas.teams      );
};

