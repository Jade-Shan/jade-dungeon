/* jshint esversion: 8 */

let observer = {};
// let loadResources = async () => { };

let loadMapDatas = async (ctx, campaignId, placeId, sceneId, userId) => {
	await requestMapDatas(campaignId, placeId, sceneId).then((data) => { 
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
	loadItemsOnMap(ctx, scene.walls,      mapDatas.walls     );
	loadItemsOnMap(ctx, scene.doors,      mapDatas.doors     );
	loadItemsOnMap(ctx, scene.furnishing, mapDatas.furnishing);
	loadItemsOnMap(ctx, scene.creaters,   mapDatas.creaters  );
	// loadItemsOnMap(ctx, scene.teams,      mapDatas.teams     );
	if (mapDatas.teams) {
		for (let i = 0; i< mapDatas.teams.length; i++) {
			// console.log(mapDatas.teams[i].id + " <> " +  userId);
			if (mapDatas.teams[i].id == userId) { // 名字和当前用户相同的是第一视角
				observer = new Observer(ctx, userId, mapDatas.teams[i].x, mapDatas.teams[i].y,
					viewRange, "#0000FF", "#FFFFFF", scene.images[mapDatas.teams[i].imgKey], 
					true, false);
			} else {  // 其他的是队友视角
				let obj = dataToItem(ctx, mapDatas.teams[i]);
				if (obj) { scene.teams.push(obj); }
			}
		}
	}
};

let initSence = async () => {

	scene.width  = scene.images.map.width;
	scene.height = scene.images.map.height;
	canvas.setAttribute( 'width', scene.width );
	canvas.setAttribute('height', scene.height);


};

let drawSence = async () => {

	// 无光效果
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(scene.images.map, 0, 0);
	ctx.fillStyle = scene.lighteness;
	ctx.fillRect(0, 0, scene.width, scene.height);
	let darkMap = new Image();
	await loadImage(darkMap, canvas.toDataURL({
		format: 'image/png', quality: 1, 
		width: scene.width, height: scene.height})
	).catch((img, url) => { alert('加载图形失败：' + url); });
	darkMap.crossOrigin='Anonymous';

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(scene.images.map, 0, 0);
	observer.draw();


 	// 渲染队友
 	observer.renderTokensOnSandboxInView(darkMap, scene.teams);
 	// 渲染陈设物
 	observer.renderTokensOnSandboxInView(darkMap, scene.furnishing);
 	// 渲染敌人
 	observer.renderTokensOnSandboxInView(darkMap, scene.creaters);
 	// 渲染墙壁
 	observer.renderTokensOnSandboxInView(darkMap, scene.walls);
 	// 渲染门
 	observer.renderTokensOnSandboxInView(darkMap, scene.doors);


	let brightMap = new Image();
	await loadImage(brightMap, canvas.toDataURL({
		format: 'image/png', quality: 1, 
		width: scene.width, height: scene.height})
	).catch((img, url) => { alert('加载图形失败：' + url); });
	brightMap.crossOrigin='Anonymous';

	// 视线范围
	ctx.drawImage(darkMap, 0, 0);
	ctx.save();
	ctx.beginPath();
	ctx.arc(observer.x, observer.y, viewRange, 0, Math.PI * 2);
	ctx.clip();
	ctx.drawImage(brightMap, 0, 0);
	ctx.restore();

	let fc   = document.getElementById("finalCanvas");
	fc.setAttribute( 'width', scene.width );
	fc.setAttribute('height', scene.height);
	let fctx = fc.getContext("2d");
	let viewMap = new Image();
	await loadImage(viewMap, canvas.toDataURL({
		format: 'image/png', quality: 1, 
		width: scene.width, height: scene.height})
	).catch((img, url) => { alert('加载图形失败：' + url); });
	fctx.drawImage(viewMap, 0, 0);
};


let drawSandTable = async () => {
	// await loadResources();
	await loadMapDatas(ctx, campaignId, placeId, sceneId, userId);
	await initSence();
	await drawSence();
	resizeLayout();
};

