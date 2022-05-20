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

let dataToItem = (ctx, scene, rec) => {
	let tkImg = {};
	if (rec.img && rec.img.imgKey) { 
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
	}
};

let loadItemsOnMap = (ctx, scene, itemList, itemMap, itemDatas) => {
	if (itemDatas) {
		for (let i = 0; i < itemDatas.length; i++) {
			let obj = dataToItem(ctx, scene, itemDatas[i]);
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
			url: encodeURI(apiRoot + "maps/" + campaignId + "/" + placeId + "/" + sceneId + "?t=" + (new Date()).getTime()), 
			type: 'GET', dataType: 'json', data: { },
			timeout: 30000,
			success: function(data, status, xhr) {
				if ('success' == data.status) {
					// console.log(data);
					resolve(data);
				} else { reject(data); }
			},
			error: function(xhr, errorType, error) { reject(xhr); },
			complete: function(xhr, status) { }
		});
	});
};


let loadMapDatas = async (ctx, scene) => {
	await requestMapDatas(scene.campaignId, scene.placeId, scene.sceneId).then((data) => { 
		imgResources = data.imgResources;
		mapDatas     = data.mapDatas;
	}).catch((e) => {
		imgResources = [
			{"id":"chrt", "url": "./images/sandtable/char.png"},
			{"id":"map" , "url": "./images/sandtable/map.png" }];
		mapDatas     = {"teams": [], "creaters": [], "furnishings": [], "doors": [], "walls": []};
	});	
	for (let i = 0; i < imgResources.length; i++) {
		let rec = imgResources[i];
		let img = await loadImage(new Image(), rec.url).then((img, url) => {
			return img;
		}).catch((img, url) => { 
			// alert('加载图片失败：' + url);
		});
		// scene.imageMap[rec.id] = img;
		scene.imageMap.set(rec.id, {classType: "Image", id: rec.id, url: rec.url,
			x:0, y:0, width: img.width, height: img.height,
			image: {key: rec.id, sx:0, sy: 0, width: img.width, height: img.height, img: img}});
	}
	loadItemsOnMap(ctx, scene, scene.walls,       scene.wallMap,       mapDatas.walls      );
	loadItemsOnMap(ctx, scene, scene.doors,       scene.doorMap,       mapDatas.doors      );
	loadItemsOnMap(ctx, scene, scene.furnishings, scene.furnishingMap, mapDatas.furnishings);
	loadItemsOnMap(ctx, scene, scene.creaters,    scene.createrMap,    mapDatas.creaters   );
	loadItemsOnMap(ctx, scene, scene.teams,       scene.teamMap,       mapDatas.teams      );
};







