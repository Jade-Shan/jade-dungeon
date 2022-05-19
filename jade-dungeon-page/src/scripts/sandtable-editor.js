/* jshint esversion: 8 */
class SandTableEditor {

	constructor(canvas, tkImgCanvas,scene, userId) {
		this.canvas    = canvas;
		this.ctx       = this.canvas.getContext("2d");
		this.tkImgCanvas = tkImgCanvas;
		this.tkImgCtx    = tkImgCanvas.getContext("2d");
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
		this.canvas.onmousemove = (e) => {
			let offset = self.sumCanvasOffset(self.canvas, {x:0, y:0});
			// console.log(`${offset.x}, ${offset.y}`);
			self.endX = e.pageX - offset.x;
			self.endY = e.pageY - offset.y;
			self.canvasMouseDrag(self.endX, self.endY);
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
		let wHeight     = parseInt(window.innerHeight);
		let mapArea     = document.querySelector("#mapArea");
		// let ctrlPanel   = document.querySelector("#ctrlPanel");
		let propImgArea = document.querySelector("#propImgArea");
		let cpHeight  = parseInt(propImgArea.clientHeight);

		let maHeight = wHeight - cpHeight;
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

		// 缓存当前图片
		let brightMap = new Image();
		await loadImage(brightMap, canvas.toDataURL({
			format: 'image/png', quality: 1, 
			width: this.scene.width, height: this.scene.height})
		).catch((img, url) => { alert('加载图形失败：' + url); });
		brightMap.crossOrigin='Anonymous';
		this.brightMap = brightMap;
	}

	async updateToken() {
		if (this.currEditing) {
			let token = this.currEditing;
			if ("canvas.shape.2d.Rectangle" == token.classType) {
				token.id           = $('#tkId'       ).val();
				token.x            = $('#tkX'        ).val();
				token.y            = $('#tkY'        ).val();
				token.width        = $('#tkWidth'    ).val();
				token.height       = $('#tkHeigh'    ).val();
				token.image.key    = $('#tkImgKey'   ).val();
				token.image.sx     = $('#tkImgX'     ).val();
				token.image.sy     = $('#tkImgY'     ).val();
				token.image.width  = $('#tkImgWidth' ).val();
				token.image.height = $('#tkImgHeight').val();
			} else if ("canvas.shape.2d.Circle" == token.classType) {
				token.id           = $('#tkId'       ).val();
				token.x            = $('#tkX'        ).val();
				token.y            = $('#tkY'        ).val();
				token.radius       = $('#tkRadius'   ).val();
				token.image.key    = $('#tkImgKey'   ).val();
				token.image.sx     = $('#tkImgX'     ).val();
				token.image.sy     = $('#tkImgY'     ).val();
				token.image.width  = $('#tkImgWidth' ).val();
				token.image.height = $('#tkImgHeight').val();
			} 
			this.tkImgCanvas.setAttribute( 'width', token.image.img.width );
			this.tkImgCanvas.setAttribute('height', token.image.img.height);
			this.tkImgCtx.clearRect(0, 0, token.image.img.width, token.image.img.height);
			this.tkImgCtx.drawImage(token.image.img, 0, 0);
			this.tkImgCtx.save();
			this.tkImgCtx.lineWidth = 3;
			this.tkImgCtx.fillStyle   = "rgba(0, 0, 255, 0.5)";
			this.tkImgCtx.fillRect(token.image.sx, token.image.sy, token.image.width,  token.image.height);
			this.tkImgCtx.strokeStyle = "rgba(255, 0, 0, 0.7)";
			this.tkImgCtx.strokeRect(token.image.sx, token.image.sy, token.image.width,  token.image.height);
			this.tkImgCtx.restore();
			// 
			await this.drawSence();
		}
	}

	selectToken(token) {
		this.currEditing = token;
		if ("canvas.shape.2d.Rectangle" == token.classType) {
			$('#tk-prop-editer').html(editorHtmlRect);
			$('#tkId'       ).val(token.id          );
			$('#tkX'        ).val(token.x           );
			$('#tkY'        ).val(token.y           );
			$('#tkWidth'    ).val(token.width       );
			$('#tkHeigh'    ).val(token.height      );
			$('#tkImgKey'   ).val(token.image.key   );
			$('#tkImgX'     ).val(token.image.sx    );
			$('#tkImgY'     ).val(token.image.sy    );
			$('#tkImgWidth' ).val(token.image.width );
			$('#tkImgHeight').val(token.image.height);
			// this.tkImgCanvas.setAttribute( 'width', token.image.img.width );
			// this.tkImgCanvas.setAttribute('height', token.image.img.height);
			// this.tkImgCtx.clearRect(0, 0, token.image.img.width, token.image.img.height);
			// this.tkImgCtx.drawImage(token.image.img, 0, 0);
			// this.tkImgCtx.save();
			// this.tkImgCtx.lineWidth = 3;
			// this.tkImgCtx.fillStyle   = "rgba(0, 0, 255, 0.5)";
			// this.tkImgCtx.fillRect(token.image.sx, token.image.sy, token.image.width,  token.image.height);
			// this.tkImgCtx.strokeStyle = "rgba(255, 0, 0, 0.7)";
			// this.tkImgCtx.strokeRect(token.image.sx, token.image.sy, token.image.width,  token.image.height);
			// this.tkImgCtx.restore();
		} else if ("canvas.shape.2d.Circle" == token.classType) {
			$('#tk-prop-editer').html(editorHtmlCirc);
			$('#tkId'       ).val(token.id          );
			$('#tkX'        ).val(token.x           );
			$('#tkY'        ).val(token.y           );
			$('#tkRadius'   ).val(token.radius      );
			$('#tkImgKey'   ).val(token.image.key   );
			$('#tkImgX'     ).val(token.image.sx    );
			$('#tkImgY'     ).val(token.image.sy    );
			$('#tkImgWidth' ).val(token.image.width );
			$('#tkImgHeight').val(token.image.height);
		} 
		this.tkImgCanvas.setAttribute( 'width', token.image.img.width );
		this.tkImgCanvas.setAttribute('height', token.image.img.height);
		this.tkImgCtx.clearRect(0, 0, token.image.img.width, token.image.img.height);
		this.tkImgCtx.drawImage(token.image.img, 0, 0);
		this.tkImgCtx.save();
		this.tkImgCtx.lineWidth = 3;
		this.tkImgCtx.fillStyle   = "rgba(0, 0, 255, 0.5)";
		this.tkImgCtx.fillRect(token.image.sx, token.image.sy, token.image.width,  token.image.height);
		this.tkImgCtx.strokeStyle = "rgba(255, 0, 0, 0.7)";
		this.tkImgCtx.strokeRect(token.image.sx, token.image.sy, token.image.width,  token.image.height);
		this.tkImgCtx.restore();
	}

	canvasMouseDown(x, y) {
		// console.log(`click: ${x}, ${y}`);
		this.currSelected = undefined;
		for(let i=0; i < this.scene.allTokens.length; i++) {
			let token = this.scene.allTokens[i];
			if (token.isHit(x, y)) {
				console.log(`hit: ${token.id}`);
				this.selectToken(token);
				break;
			}
		}
	}

	canvasMouseDrag(x, y) {
		if (this.currSelected) {
			if (this.isMovingItem) {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.ctx.drawImage(this.brightMap, 0, 0);
				this.currSelected.onMoveing(x - this.startX, y - this.startY);
			} else if (this.isScalingItem) {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.ctx.drawImage(this.brightMap, 0, 0);
				this.currSelected.onScaleing(x - this.startX, y - this.startY);
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
				this.currSelected.scale(x - this.startX, y - this.startY);
			}
			console.log(`click up: ${this.currSelected.x}, ${this.currSelected.y}`);
			this.currSelected = undefined;
			this.drawSence();
		}
	}

}
