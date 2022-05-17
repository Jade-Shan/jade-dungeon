/* jshint esversion: 8 */
let imgResources = [];
let mapDatas     = [];
let scene  = {
	width: 0, height: 0, lighteness: 'rgba(0, 0, 0, 0.7)',
	creaters : [], teams: [], walls: [], doors: [], furnishing: [], images:{}};

let viewRange = 500;

let canvas = document.getElementById("canvas");
let ctx    = canvas.getContext("2d");

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

let dataToItem = (ctx, rec) => {
	if ('Line' === rec.type) {
		return new Line(ctx, rec.id, rec.x, rec.y, rec.x2, rec.y2, rec.color, rec.visiable, rec.blockView);
	} else if ('Rectangle' === rec.type) {
		return new Rectangle(ctx, rec.id, rec.x, rec.y, rec.width, rec.height, 
			rec.color, scene.images[rec.imgKey], rec.visiable, rec.blockView);
	} else if ('Circle' === rec.type) {
		return new Circle(ctx, rec.id, rec.x, rec.y, rec.radius, 
			rec.color, scene.images[rec.imgKey], rec.visiable, rec.blockView);
	}
};

let loadItemsOnMap = (ctx, itemsOnScene, itemDatas) => {
	if (itemDatas) {
		for (let i = 0; i < itemDatas.length; i++) {
			let obj = dataToItem(ctx, itemDatas[i]);
			if (obj) { itemsOnScene.push(obj); }
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

