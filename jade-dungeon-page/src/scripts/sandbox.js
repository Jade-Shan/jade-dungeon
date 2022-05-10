/* jshint esversion: 8 */
let scene  = {
	width: 0, height: 0, lighteness: 'rgba(0, 0, 0, 0.7)',
	creaters : [], teams: [], walls: [], doors: [], furnishing: [], images:[]};
let observer = {};

let viewRange = 500;

var canvas = document.getElementById("canvas");
var ctx    = canvas.getContext("2d");

let loadResources = async () => {
	for (let i=0; i<imgResources.length; i++) {
		let rec = imgResources[i];
		scene.images[rec.key] = await loadImage(new Image(), rec.url).catch((img, url) => { 
			// alert('加载图片失败：' + url);
		});
	}
};

let loadMapDataRec = (ctx, rec) => {
	if ('Line' === rec.type) {
		return new Line(ctx, rec.x, rec.y, rec.x2, rec.y2, rec.color, rec.visiable, rec.blockView);
	} else if ('Rectangle' === rec.type) {
		return new Rectangle(ctx, rec.x, rec.y, rec.width, rec.height, 
			rec.color, scene.images[rec.imgKey], rec.visiable, rec.blockView);
	} else if ('Circle' === rec.type) {
		return new Circle(ctx, rec.x, rec.y, rec.radius, 
			rec.color, scene.images[rec.imgKey], rec.visiable, rec.blockView);
	}
};

let loadMapDatas = (ctx, mapDatas) => {
	if (mapDatas.walls) {
		for (let i = 0; i< mapDatas.walls.length; i++) {
			let obj = loadMapDataRec(ctx, mapDatas.walls[i]);
			if (obj) { scene.walls.push(obj); }
		}
	}
	if (mapDatas.doors) {
		for (let i = 0; i< mapDatas.doors.length; i++) {
			let obj = loadMapDataRec(ctx, mapDatas.doors[i]);
			if (obj) { scene.doors.push(obj); }
		}
	}
	if (mapDatas.furnishing) {
		for (let i = 0; i< mapDatas.furnishing.length; i++) {
			let obj = loadMapDataRec(ctx, mapDatas.furnishing[i]);
			if (obj) { scene.furnishing.push(obj); }
		}
	}
	if (mapDatas.creaters) {
		for (let i = 0; i< mapDatas.creaters.length; i++) {
			let obj = loadMapDataRec(ctx, mapDatas.creaters[i]);
			if (obj) { scene.creaters.push(obj); }
		}
	}
	if (mapDatas.teams) {
		for (let i = 0; i< mapDatas.teams.length; i++) {
			let obj = loadMapDataRec(ctx, mapDatas.teams[i]);
			if (obj) { scene.teams.push(obj); }
		}
	}
};

let initSence = async () => {

	scene.width  = scene.images.map.width;
	scene.height = scene.images.map.height;
	canvas.setAttribute( 'width', scene.width );
	canvas.setAttribute('height', scene.height);

	observer = new Observer(ctx, 250, 300, viewRange, "#0000FF", "#FFFFFF", scene.images.chrt, true, false);

	loadMapDatas(ctx, mapDatas);

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
	await loadResources();
	await initSence();
	await drawSence();
	resizeLayout();
};

