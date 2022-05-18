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

		this.isMovingItem  = false;
		this.isScalingItem = false;
		let self = this;
		this.canvas.onmousedown = (e) => {
			let offset = self.sumCanvasOffset(self.canvas, {x:0, y:0});
			// console.log(`${offset.x}, ${offset.y}`);
			self.startX = e.pageX - offset.x;
			self.startY = e.pageY - offset.y;
			self.canvasMouseDown(self.startX, self.startY);
		};
		this.canvas.onmouseup = (e) => {
			let offset = self.sumCanvasOffset(self.canvas, {x:0, y:0});
			// console.log(`${offset.x}, ${offset.y}`);
			self.endX = e.pageX - offset.x;
			self.endY = e.pageY - offset.y;
			self.canvasMouseUp(self.endX, self.endY);
		};
		document.addEventListener("keydown", (e) => {
			// console.log(`${e.key} - ${e.key == 'Control'} - ${e.key == 'Alt'}`);
			if (e.key == 'Control'){
				self.isMovingItem  = true;
			} else if (e.key == 'Alt'){
				self.isScalingItem = true;
			}
		});
		document.addEventListener("keyup", (e) => {
			// console.log(`${e.key} - ${e.key == 'Control'} - ${e.key == 'Alt'}`);
			if (e.key == 'Control'){
				self.isMovingItem  = false;
			} else if (e.key == 'Alt'){
				self.isScalingItem = false;
			}
		});

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

	canvasMouseDown(x, y) {
		// console.log(`click: ${x}, ${y}`);
		this.currSelected = undefined;
		for(let i=0; i < this.scene.allTokens.length; i++) {
			let obj = this.scene.allTokens[i];
			if (obj.isHit(x, y)) {
				console.log(`hit: ${obj.id}`);
				this.currSelected = obj;
				break;
			}
		}
	}

	canvasMouseUp(x, y) {
		console.log(`click up: ${x - this.startX}, ${y - this.startY}`);
		if (this.currSelected) {
			console.log(`click up: ${this.currSelected.x}, ${this.currSelected.y}`);
			if (this.isMovingItem) {
				this.currSelected.move(x - this.startX, y - this.startY);
			} else if (this.isScalingItem) {
				this.currSelected.scaling(x - this.startX, y - this.startY);
			}
			console.log(`click up: ${this.currSelected.x}, ${this.currSelected.y}`);
			this.currSelected = undefined;
			this.drawSence();
		}
	}

}
