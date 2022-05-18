/* jshint esversion: 8 */
class SandTableEditor {

	constructor(canvas, scene, userId) {
		this.canvas    = canvas;
		this.ctx       = canvas.getContext("2d");
		this.userId    = userId;
		this.observer  = {};
		this.scene     = { width: 0, height: 0, 
			campaignId: scene.campaignId, placeId: scene.placeId, sceneId: scene.sceneId,
			shadowColor: scene.shadowColor, viewRange: scene.viewRange,
			creaters : [], teams: [], walls: [], doors: [], furnishing: [], images:{}};
		this.scene.createrMap    = new Map();
		this.scene.teamMap       = new Map();
		this.scene.wallMap       = new Map();
		this.scene.doorMap       = new Map();
		this.scene.furnishingMap = new Map();
	}

	async initSence() {
		this.scene.width  = this.scene.imageMap.map.width;
		this.scene.height = this.scene.imageMap.map.height;
		canvas.setAttribute( 'width', this.scene.width );
		canvas.setAttribute('height', this.scene.height);
	}

	resizeLayout() {
		let wWidth    = parseInt(window.innerWidth);
		let wHeight   = parseInt(window.innerHeight);
		let mapArea   = document.querySelector("#mapArea");
		let ctrlPanel = document.querySelector("#ctrlPanel");
		let cpHeight = 150; // parseInt(ctrlPanel.style.height);

		let maWidth  = wWidth - 30;
		let maHeight = wHeight - cpHeight - 30;
		// mapArea.style.width  = maWidth  + "px";
		mapArea.style.height = maHeight + "px";
	}

	async drawSandTable() {
		await loadMapDatas(this.ctx, this.scene);
		await this.initSence();
		await this.drawSence();
		this.resizeLayout();
	}

	async drawSence() {

		// 无光效果
		this.ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.ctx.drawImage(this.scene.images.map, 0, 0);

	}

}
