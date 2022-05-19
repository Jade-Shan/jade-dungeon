/* jshint esversion: 8 */

let loadImage = async (image, imageURL) => {
	return new Promise((resolve, reject) => {
		image.onload  = () => { 
			resolve(image, imageURL); 
		};
		image.onabort = () => { 
			reject(image, imageURL); 
		};
		image.onerror = () => { 
			reject(image, imageURL); 
		};
		image.src = imageURL;
		image.crossOrigin='Anonymous';
	});
};

let sleepMS = async (ms) =>  {
	return new Promise((resolve, reject) => {
		setTimeout(() => { resolve(); }, ms);
	});
};

let dataToItem = (ctx, scene, rec) => {
	let tkImg = {};
	if (rec.img && rec.img.imgKey) { tkImg.img    = scene.images[rec.img.imgKey]; }
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
			url: encodeURI(apiRoot + "maps/" + campaignId + "/" + placeId + "/" + sceneId), 
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
	});	
	for (let i = 0; i < imgResources.length; i++) {
		let rec = imgResources[i];
		scene.images[rec.key] = await loadImage(new Image(), rec.url).then((img, url) => {
			return img;
		}).catch((img, url) => { 
			// alert('加载图片失败：' + url);
		});
	}
	loadItemsOnMap(ctx, scene, scene.walls,      scene.wallMap,      mapDatas.walls     );
	loadItemsOnMap(ctx, scene, scene.doors,      scene.doorMap,      mapDatas.doors     );
	loadItemsOnMap(ctx, scene, scene.furnishing, scene.furnishingMap, mapDatas.furnishing);
	loadItemsOnMap(ctx, scene, scene.creaters,   scene.createrMap,   mapDatas.creaters  );
	loadItemsOnMap(ctx, scene, scene.teams,      scene.teamMap,      mapDatas.teams     );
};







