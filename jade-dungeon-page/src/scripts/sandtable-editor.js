/* jshint esversion: 8 */
class SandTableEditor {

	constructor(canvas, scene, userId) {
		this.canvas    = canvas;
		this.ctx       = this.canvas.getContext("2d");
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
		// 目前选中正在编辑的目标
		this.currSelected = undefined;
	}

	sumCanvasOffset(docNode, result) {
		result.x = result.x + docNode.offsetLeft - docNode.scrollLeft;
		result.y = result.y + docNode.offsetTop  - docNode.scrollTop;
		return docNode.offsetParent ? 
			this.sumCanvasOffset(docNode.offsetParent, result) :
			result;
	}

	async initSence() {
		this.scene.width  = this.scene.images.map.width;
		this.scene.height = this.scene.images.map.height;
		this.canvas.setAttribute( 'width', this.scene.width );
		this.canvas.setAttribute('height', this.scene.height);
		let self = this;
		this.canvas.onmousedown = (e) => {
			let offset = self.sumCanvasOffset(self.canvas, {x:0, y:0});
			console.log(`${offset.x}, ${offset.y}`);
			let x = e.pageX - offset.x;
			let y = e.pageY - offset.y;
			self.clickCanvas(x, y);
		};
	}

	resizeLayout() {
		let wHeight   = parseInt(window.innerHeight);
		let mapArea   = document.querySelector("#mapArea");
		let ctrlPanel = document.querySelector("#ctrlPanel");
		let cpHeight  = parseInt(ctrlPanel.clientHeight);

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

	drawTokens(tokens) {
		for (let e in tokenMap) {
			e[1].drawDesign();
		}
	}

	async drawSence() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(this.scene.images.map, 0, 0);

		this.scene.allTokens = this.scene.creaters.concat( 
			this.scene.teams) .concat( 
				this.scene.walls).concat( 
					this.scene.doors).concat( 
						this.scene.furnishing);

		this.scene.allTokens.forEach((e, i) => { e.drawDesign(); });
	}

	clickCanvas(x, y) {
		console.log(`click: ${x}, ${y}`);
		for(let i=0; i < this.scene.allTokens.length; i++) {
			let obj = this.scene.allTokens[i];
			if (obj.isHit(x, y)) {
				console.log(`hit: ${obj.id}`);
				break;
			}
		}
	}

}
