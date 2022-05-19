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
			shadowColor: scene.shadowColor, viewRange: scene.viewRange, allTokens: [],
			creaters : [], teams: [], walls: [], doors: [], furnishing: [], images:{}};
		this.scene.teamMap       = new Map();
		this.scene.createrMap    = new Map();
		this.scene.furnishingMap = new Map();
		this.scene.doorMap       = new Map();
		this.scene.wallMap       = new Map();
		this.scene.imageMap      = new Map();
		this.scene.tokenGroupIcons = {}; 
		this.scene.tokenGroupIcons.team       = '&#128100';
		this.scene.tokenGroupIcons.creater    = '&#128126';
		this.scene.tokenGroupIcons.furnishing = '&#128452';
		this.scene.tokenGroupIcons.door       = '&#128682';
		this.scene.tokenGroupIcons.wall       = '&#127959';
		this.scene.tokenGroupIcons.image      = '&#127756';
		// 目前选中正在编辑的目标
		this.currSelected = undefined;
	}

	listGroupTokens(groupName) {
		let icon  = this.scene.tokenGroupIcons[groupName];
		let group = this.scene[groupName + 'Map'];
		let html = '';
		for (let e of group) {
			html = html + '<tr><td>' + icon + '</td><td ' + 
				'onClick="javascript:sandtable.selectTokenOnList(\'' + 
				groupName + '\',\'' + e[0] + '\');">' + e[0] + '</td><td>' + 
				'<button type="button" onClick="javascript:sandtable.deleteToken(\'' + 
				groupName + '\',\'' + e[0] + '\');" class="btn btn-xs btn-danger">' + 
				'&#10062</button></td></tr>';
		}
		$('#token-list').html(html);
		// 
		html = '';
		html = html + '<button type="button" onClick="javascript:sandtable.createToken(\'' +
			groupName + '\');" class="btn btn-default">&#9585</button>';
		html = html + '<button type="button" onClick="javascript:sandtable.createToken(\'' + 
			groupName + '\');" class="btn btn-default">&#9634</button>';
		html = html + '<button type="button" onClick="javascript:sandtable.createToken(\'' + 
			groupName + '\');" class="btn btn-default">&#9711</button>';
		$('#tokenCreateBtns').html(html);
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
		let propImgArea = document.querySelector("#propImgArea");
		let tokenGroupBtns  = document.querySelector("#tokenGroupBtns");
		let tokenListArea   = document.querySelector("#tokenListArea");
		let tokenCreateBtns = document.querySelector("#tokenCreateBtns");

		let cpHeight  = parseInt(propImgArea.clientHeight);
		let tgbHeight = parseInt(tokenGroupBtns.clientHeight);
		let tlaHeight = parseInt(tokenListArea.clientHeight);
		let tcbHeight = parseInt(tokenCreateBtns.clientHeight);

		let maHeight = wHeight - cpHeight;
		mapArea.style.height = maHeight + "px";
		let tlHeight = maHeight - tgbHeight - tcbHeight;
		tokenListArea.style.height = tlHeight + 'px';
	}

	async drawSandTable() {
		await loadMapDatas(this.ctx, this.scene);
		await this.initSence();
		await this.drawSence();
		this.resizeLayout();
		this.listGroupTokens('team');
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
			if ("canvas.shape.2d.Line" == token.classType) {
				token.x2 = $('#tkX2').val();
				token.y2 = $('#tkY2').val();
			} else if ("canvas.shape.2d.Rectangle" == token.classType) {
				token.width  = $('#tkWidth').val();
				token.height = $('#tkHeigh').val();
			} else if ("canvas.shape.2d.Circle" == token.classType) {
				token.radius = $('#tkRadius').val();
			} 
			token.image.key    = $('#tkImgKey'   ).val();
			token.image.sx     = $('#tkImgX'     ).val();
			token.image.sy     = $('#tkImgY'     ).val();
			token.image.width  = $('#tkImgWidth' ).val();
			token.image.height = $('#tkImgHeight').val();
			//
			token.image.img = this.scene.images[token.image.key];
			if (token.image.img) {
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
			} else {
				this.tkImgCanvas.setAttribute( 'width', 10);
				this.tkImgCanvas.setAttribute('height', 10);
				this.tkImgCtx.clearRect(0, 0, 10, 10);
			}
			// 
			await this.drawSence();
		}
	}

	selectToken(token) {
		this.currEditing = token;
		if ("canvas.shape.2d.Line" == token.classType) {
			$('#tk-prop-editer').html(editorHtmlLine);
			$('#tkX2').val(token.x2);
			$('#tkY2').val(token.y2);
		} else if ("canvas.shape.2d.Rectangle" == token.classType) {
			$('#tk-prop-editer').html(editorHtmlRect);
			$('#tkWidth').val(token.width );
			$('#tkHeigh').val(token.height);
		} else if ("canvas.shape.2d.Circle" == token.classType) {
			$('#tk-prop-editer').html(editorHtmlCirc);
			$('#tkRadius').val(token.radius);
		} else if ("Image" == token.classType) {
			$('#tk-prop-editer').html(editorHtmlImg);
			$('#tkURL'       ).val(token.url          );
		} 
		$('#tkId'       ).val(token.id          );
		$('#tkX'        ).val(token.x           );
		$('#tkY'        ).val(token.y           );
		$('#tkImgKey'   ).val(token.image.key   );
		$('#tkImgX'     ).val(token.image.sx    );
		$('#tkImgY'     ).val(token.image.sy    );
		$('#tkImgWidth' ).val(token.image.width );
		$('#tkImgHeight').val(token.image.height);
		//
		if (token.image.img) {
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
		} else {
			this.tkImgCanvas.setAttribute( 'width', 10);
			this.tkImgCanvas.setAttribute('height', 10);
			this.tkImgCtx.clearRect(0, 0, 10, 10);
		}
	}

	canvasMouseDown(x, y) {
		// console.log(`click: ${x}, ${y}`);
		this.currSelected = undefined;
		for(let i=0; i < this.scene.allTokens.length; i++) {
			let token = this.scene.allTokens[i];
			if (token.isHit(x, y)) {
				console.log(`hit: ${token.id}`);
				this.currSelected = token;
				this.selectToken(token);
				break;
			}
		}
	}

	selectTokenOnList(groupName, id) {
		let group = this.scene[groupName + 'Map'];
		let token = group.get(id);
		this.selectToken(token);
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
