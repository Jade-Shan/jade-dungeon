/* jshint esversion: 8 */

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

let loadImage = async (image, imageURL) => {
	return new Promise((resolve, reject) => {
		image.src = imageURL;
		// image.crossOrigin='Anonymous';
		// image.crossorigin='anonymous';
		// image.crossOrigin = "anonymous";
		// image.setAttribute('crossOrigin', 'anonymous');
		// image.setAttribute('crossorigin', 'anonymous');
		image.onload  = () => { 
			resolve(image, imageURL); 
		};
		image.onabort = () => { 
			reject(image, imageURL); 
		};
		image.onerror = () => { 
			reject(image, imageURL); 
		};
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
	let tkImg = {};
	if ('Image' != rec.type && rec.img && rec.img.imgKey) { 
		tkImg.key = rec.img.imgKey; 
		tkImg.img = scene.imageMap.get(rec.img.imgKey).image.img; 
	}
	if (rec.img && rec.img.sx    ) { tkImg.sx     = rec.img.sx    ; }
	if (rec.img && rec.img.sy    ) { tkImg.sy     = rec.img.sy    ; }
	if (rec.img && rec.img.width ) { tkImg.width  = rec.img.width ; }
	if (rec.img && rec.img.height) { tkImg.height = rec.img.height; }
	if ('Line' === rec.type) {
		return new Line(ctx, rec.id, rec.x, rec.y, rec.x2, rec.y2, rec.color, rec.visiable, rec.blockView);
	} else if ('Rectangle' === rec.type) {
		return new Rectangle(ctx, rec.id, rec.x, rec.y, rec.width, rec.height, 
			rec.color, tkImg, rec.visiable, rec.blockView);
	} else if ('Circle' === rec.type) {
		return new Circle(ctx, rec.id, rec.x, rec.y, rec.radius, 
			rec.color, tkImg, rec.visiable, rec.blockView);
	} else if ('Image' === rec.type) {
		let img = await loadImage(new Image(), rec.url).then(
			(img, url) => { return img; }).catch((img, url) => { });
		return {classType: "Image", id: rec.id, url: rec.url,
			x:0, y:0, width: img.width, height: img.height,
			image: {key: rec.id, sx:0, sy: 0, width: img.width, height: img.height, img: img}};

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

let requestMapDatas = async (campaignId, placeId, sceneId) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: apiRoot + 'load-map?campaignId=' + encodeURIComponent(campaignId) + 
				'&placeId=' + encodeURIComponent(placeId) + '&sceneId='+ encodeURIComponent(sceneId) +
				"&t=" + (new Date()).getTime(), 
			type: 'GET', dataType: 'json', data: { },
			timeout: 30000,
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
			type: 'POST', dataType: 'json', data: {jsonStr: jsonStr},
			timeout: 30000,
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
			{"id":"chrt", "url": "./images/sandtable/char.png"},
			{"id":"map" , "url": "./images/sandtable/map.png" }];
		mapDatas     = {"teams": [], "creaters": [], "furnishings": [], "doors": [], "walls": []};
	});	
	/*
	for (let i = 0; i < imgResources.length; i++) {
		let rec = imgResources[i];
		let img = await loadImage(new Image(), rec.url).then((img, url) => { return img; }).catch((img, url) => { });
		let 
		scene.imageMap.set(rec.id, );
	}
	*/
	await loadItemsOnMap(ctx, scene, scene.images,      scene.imageMap,      imgResources        );
	await loadItemsOnMap(ctx, scene, scene.walls,       scene.wallMap,       mapDatas.walls      );
	await loadItemsOnMap(ctx, scene, scene.doors,       scene.doorMap,       mapDatas.doors      );
	await loadItemsOnMap(ctx, scene, scene.furnishings, scene.furnishingMap, mapDatas.furnishings);
	await loadItemsOnMap(ctx, scene, scene.creaters,    scene.createrMap,    mapDatas.creaters   );
	await loadItemsOnMap(ctx, scene, scene.teams,       scene.teamMap,       mapDatas.teams      );
};

