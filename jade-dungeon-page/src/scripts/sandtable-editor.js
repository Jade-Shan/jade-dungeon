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
			creaters : [], teams: [], walls: [], doors: [], furnishings: [], images:[]};
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
		this.scene.tokenGroupText = {}; 
		this.scene.tokenGroupText.team       = '创建新玩家：';
		this.scene.tokenGroupText.creater    = '创建新生物：';
		this.scene.tokenGroupText.furnishing = '创建新陈设：';
		this.scene.tokenGroupText.door       = '创建新门户：';
		this.scene.tokenGroupText.wall       = '创建新墙壁：';
		this.scene.tokenGroupText.image      = '创建新图像：';
		// 目前选中正在编辑的目标
		this.currDragging  = undefined;
		// 将要创建的目标
		this.addTokenGroup = undefined;
		this.addTokenType  = undefined;
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
		if ('wall' == groupName || 'door' == groupName) {
			html = html + '<button type="button" onClick="javascript:sandtable.preCreateToken(\'' +
				groupName + '\',\'Line\');" class="btn btn-default">&#9585</button>';
		}
		if ('wall' == groupName || 'door' == groupName || 'furnishing' == groupName) {
			html = html + '<button type="button" onClick="javascript:sandtable.preCreateToken(\'' + 
				groupName + '\',\'Rectangle\');" class="btn btn-default">&#9634</button>';
		}
		if ('wall' == groupName || 'door' == groupName || 'furnishing' == groupName || 
			'team' == groupName || 'creater' == groupName) //
		{
			html = html + '<button type="button" onClick="javascript:sandtable.preCreateToken(\'' + 
				groupName + '\',\'Circle\');" class="btn btn-default">&#9711</button>';
		}
		if ('image' == groupName) {
			html = html + '<button type="button" onClick="javascript:sandtable.createToken(\'' + 
				groupName + '\',\'Image\');" class="btn btn-default">&#9711</button>';
		}
		html = html + '';
		$('#tokenCreateBtns').html(html);
		$('#tokenCreateText').html(this.scene.tokenGroupText[groupName]);
		$('#optSaveBtns').html('<button onClick="javascript:sandtable.saveAllMapData();"' +
			'type="button" class="btn btn-default">保存</button>' + 
			'<button onClick="javascript:sandtable.loadMoveRequest();"' +
			'type="button" class="btn btn-default">刷新请求</button>');
	}


	sumCanvasOffset(docNode, result) {
		result.x = result.x + docNode.offsetLeft - docNode.scrollLeft;
		result.y = result.y + docNode.offsetTop  - docNode.scrollTop;
		return docNode.offsetParent ? 
			this.sumCanvasOffset(docNode.offsetParent, result) :
			result;
	}

	async initSence() {
		this.scene.width  = this.scene.imageMap.get('map').image.img.width;
		this.scene.height = this.scene.imageMap.get('map').image.img.height;
		this.canvas.setAttribute( 'width', this.scene.width );
		this.canvas.setAttribute('height', this.scene.height);

		this.isMovingItem  = false;
		this.isScalingItem = false;
		let self = this;
		this.canvas.onmousedown = (e) => {
			let offset = self.sumCanvasOffset(self.canvas, {x:0, y:0});
			// console.log(`${offset.x}, ${offset.y}`);
			self.startX = parseInt(e.pageX - offset.x);
			self.startY = parseInt(e.pageY - offset.y);
			self.canvasMouseDown(self.startX, self.startY);
		};
		this.canvas.onmousemove = (e) => {
			let offset = self.sumCanvasOffset(self.canvas, {x:0, y:0});
			// console.log(`${offset.x}, ${offset.y}`);
			self.endX = parseInt(e.pageX - offset.x);
			self.endY = parseInt(e.pageY - offset.y);
			self.canvasMouseDrag(self.endX, self.endY);
		};
		this.canvas.onmouseup = (e) => {
			let offset = self.sumCanvasOffset(self.canvas, {x:0, y:0});
			// console.log(`${offset.x}, ${offset.y}`);
			self.endX = parseInt(e.pageX - offset.x);
			self.endY = parseInt(e.pageY - offset.y);
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
		let createTokenArea = document.querySelector("#createTokenArea");
		let optSaveBtnsArea = document.querySelector("#optSaveBtnsArea");

		let cpHeight  = parseInt(propImgArea.clientHeight);
		let tgbHeight = parseInt(tokenGroupBtns.clientHeight);
		let tlaHeight = parseInt(tokenListArea.clientHeight);
		let tcbHeight = parseInt(createTokenArea.clientHeight);
		let osbHeight = parseInt(optSaveBtnsArea.clientHeight);

		let maHeight = wHeight - cpHeight - 10;
		mapArea.style.height = maHeight + "px";
		let tlHeight = maHeight - tgbHeight - tcbHeight - osbHeight - 30;
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
		this.ctx.drawImage(this.scene.imageMap.get('map').image.img, 0, 0);

		this.scene.allTokens = this.scene.walls.concat(this.scene.doors).concat( 
						this.scene.furnishings).concat(this.scene.creaters.concat(this.scene.teams));

		this.scene.allTokens.forEach((e, i) => { e.drawDesign(); });

		await this.loadMoveRequest();
		// 缓存当前图片
		this.brightMap = await loadImage(new Image(), canvas.toDataURL({
			format: 'image/png', quality: 1, 
			width: this.scene.width, height: this.scene.height})
		).catch((img, url) => { alert('加载图形失败：' + url); });
		// brightMap.crossOrigin='Anonymous';
	}

	async loadMoveRequest() {
		await loadMoveRequest(this.scene.campaignId, this.scene.placeId, 
			this.scene.sceneId).then(async (data) => {
				// console.log(data);
				// this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				// this.ctx.drawImage(this.brightMap, 0, 0);
				for(let key in data.data) {
					let pos   = data.data[key];
					let token = this.scene.teamMap.get(key);
					if (token && pos && pos.x && pos.y) {
						token.onMoveing(token.x + 5, token.y + 5, pos.x, pos.y);
						token.drawDesign();
					}
				}
			}).catch((err) => {
				alert("网络异常");
			});
	}

	seriseMapData () {
		let mapDatas = {"mapDatas": {}};
		mapDatas.username   = cookieOperator('username');
		mapDatas.loginToken = cookieOperator('loginToken');
		mapDatas.imgResources         = seriseTokenMap(this.scene.imageMap     );
		mapDatas.mapDatas.teams       = seriseTokenMap(this.scene.teamMap      );
		mapDatas.mapDatas.creaters    = seriseTokenMap(this.scene.createrMap   );
		mapDatas.mapDatas.furnishings = seriseTokenMap(this.scene.furnishingMap);
		mapDatas.mapDatas.doors       = seriseTokenMap(this.scene.doorMap      );
		mapDatas.mapDatas.walls       = seriseTokenMap(this.scene.wallMap      );
		return JSON.stringify(mapDatas);
	}

	saveAllMapData() {
		let jsonStr = this.seriseMapData();	
		// console.log(jsonStr);
		updateMapDatas(this.scene.campaignId, this.scene.placeId, this.scene.sceneId, 
			jsonStr).then((data) => {
				console.log(data);
			}).catch((err) => {
				console.log(err);
				if (err.msg == "not owner") {
					alert('无权修改该战役');
				}
			});
	}

	async updateToken() {
		if (this.currEditing) {
			let token = this.currEditing;
			token.id  = $('#tkId').val();
			token.x   = parseInt($('#tkX').val());
			token.y   = parseInt($('#tkY').val());
			if ("canvas.shape.2d.Line" == token.classType) {
				token.x2 = parseInt($('#tkX2').val());
				token.y2 = parseInt($('#tkY2').val());
			} else if ("canvas.shape.2d.Rectangle" == token.classType) {
				token.width  = parseInt($('#tkWidth').val());
				token.height = parseInt($('#tkHeigh').val());
			} else if ("canvas.shape.2d.Circle" == token.classType) {
				token.radius = parseInt($('#tkRadius').val());
			} else if ("Image" == token.classType) {
				token.id  = $('#tkImgKey').val();
				token.url = $('#tkURL').val();
				token.image.img = await loadImage(new Image(), token.url);
				token.image.sx     = $('#tkImgX'     ).val();
				token.image.sy     = $('#tkImgY'     ).val();
				token.image.width  = $('#tkImgWidth' ).val();
				token.image.height = $('#tkImgHeight').val();
			} 
			token.visiable     = 'true' == $('#tkVisiable').val() ? true : false;
			token.blockView    = 'true' == $('#tkBlock'   ).val() ? true : false;
			token.color        = $('#tkColor' ).val();
			token.image.key    = $('#tkImgKey').val();
			token.image.sx     = parseInt($('#tkImgX'     ).val());
			token.image.sy     = parseInt($('#tkImgY'     ).val());
			token.image.width  = parseInt($('#tkImgWidth' ).val());
			token.image.height = parseInt($('#tkImgHeight').val());
			//
			if ("Image" != token.classType && "canvas.shape.2d.Line" != token.classType) {
				token.image.img = this.scene.imageMap.get(token.image.key).image.img;
			}
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

	editToken(token) {
		if ("canvas.shape.2d.Line" == token.classType) {
			$('#tk-prop-editer').html(editorHtmlLine);
			$('#tkX2').val(token.x2);
			$('#tkY2').val(token.y2);
		} else if ("canvas.shape.2d.Rectangle" == token.classType) {
			$('#tk-prop-editer').html(editorHtmlRect);
			$('#tkWidth').val(token.width );
			$('#tkHeigh').val(token.height);
			let imgSelectHtml = '';
			for (let e of this.scene.imageMap) {
				imgSelectHtml = imgSelectHtml + '<option value="' + e[0] + '">' + e[0] + '</option>';
			}
			$('#tkImgKey').html(imgSelectHtml);
		} else if ("canvas.shape.2d.Circle" == token.classType) {
			$('#tk-prop-editer').html(editorHtmlCirc);
			$('#tkRadius').val(token.radius);
			let imgSelectHtml = '';
			for (let e of this.scene.imageMap) {
				imgSelectHtml = imgSelectHtml + '<option value="' + e[0] + '">' + e[0] + '</option>';
			}
			$('#tkImgKey').html(imgSelectHtml);
		} else if ("Image" == token.classType) {
			$('#tk-prop-editer').html(editorHtmlImg);
			$('#tkURL'       ).val(token.url          );
		} 
		$('#tkVisiable' ).val(true == token.visiable  ? 'true' : 'false');
		$('#tkBlock'    ).val(true == token.blockView ? 'true' : 'false');
		$('#tkColor'    ).val(token.color       );
		//$('#tkColor'    ).attr('style','color:'+token.color);
		changeEditColor();
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
			if ("Image" != token.classType) {
				this.tkImgCtx.save();
				this.tkImgCtx.lineWidth = 3;
				this.tkImgCtx.fillStyle   = "rgba(0, 0, 255, 0.5)";
				this.tkImgCtx.fillRect(token.image.sx, token.image.sy, token.image.width,  token.image.height);
				this.tkImgCtx.strokeStyle = "rgba(255, 0, 0, 0.7)";
				this.tkImgCtx.strokeRect(token.image.sx, token.image.sy, token.image.width,  token.image.height);
				this.tkImgCtx.restore();
			} 
		} else {
			this.tkImgCanvas.setAttribute( 'width', 10);
			this.tkImgCanvas.setAttribute('height', 10);
			this.tkImgCtx.clearRect(0, 0, 10, 10);
		}
	}

	deleteToken(groupName, id) {
		this.currDragging = undefined;
		this.currEditing  = undefined;
		$('#tk-prop-editer').html('');
		let group = this.scene[groupName + 'Map'];
		group.delete(id);
		this.scene[groupName + 's'] = [];
		for (let e of group) { this.scene[groupName + 's'].push(e[1]); }
		this.drawSence();
		this.listGroupTokens(groupName);
	}

	preCreateToken(groupName, typeName) {
		this.addTokenGroup = groupName;
		this.addTokenType  = typeName;
	}

	createToken(groupName, typeName) {
		let id = groupName + "-" + (new Date()).getTime();
		let color = "#0000FF";
		let image = this.scene.imageMap.get('chrt').image.img;
		let tkImage = {key:'chrt', sx:0, sy:0, 
			width: image.width, height: image.height, img: image};
		let isView  = 'Line'       == typeName  ? false : true;
		let isBlock = 'furnishing' == groupName ? false : true;
		if ('Line' === typeName) {
			this.currEditing = new Line(this.ctx, id, this.startX, this.startY,  
				this.startX + 5, this.startY, "#0000FF", isView, isBlock);
		} else if ('Rectangle' === typeName) {
			this.currEditing = new Rectangle(this.ctx, id, this.startX, this.startY, 
				50, 50, color, tkImage, isView, isBlock);
		} else if ('Circle' === typeName) {
			this.currEditing = new Circle(this.ctx, id, this.startX, this.startY, 
				25, color, tkImage, isView, isBlock);
		} else if ('Image' === typeName) {
			this.currEditing = {
				classType: "Image", id: id, url: '', x: 0, y: 0, width: 0, height: 0, 
				onScaleing: () => {}, scale: () => {},
				image: {key: id, sx:0, sy: 0, width: 10, height: 10, img: undefined},
				visiable: false, blockView: false};
		}
		if (this.currEditing) {
			this.isScalingItem = true;
			this.currDragging  = this.currEditing;
			this.scene[groupName + 's'].push(this.currEditing);
			this.drawSence();
			this.scene[groupName + "Map"].set(id, this.currEditing);
			this.listGroupTokens(groupName);
			this.editToken(this.currEditing);
		}
	}


	selectTokenOnList(groupName, id) {
		let group = this.scene[groupName + 'Map'];
		let token = group.get(id);
		if (token) {
			this.currEditing = token;
			this.editToken(token);
		}
	}

	canvasMouseDown(x, y) {
		// console.log(`click: ${x}, ${y}`);
		this.currDragging = undefined;
		if (this.addTokenGroup && this.addTokenType) {
			this.createToken(this.addTokenGroup, this.addTokenType);
		} else {
			for(let i=0; i < this.scene.allTokens.length; i++) {
				let token = this.scene.allTokens[i];
				if (token.isHit(x, y)) {
					// console.log(`hit: ${token.id}`);
					this.currDragging = token;
					this.currEditing  = token;
					this.editToken(token);
					break;
				}
			}
		}
	}

	canvasMouseDrag(x, y) {
		let g = x - this.startX;
		let j = y - this.startY;
		let r = Math.sqrt(g*g + j*j);
		if (this.currDragging /* && r > 10 */) {
			if (this.isMovingItem) {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.ctx.drawImage(this.brightMap, 0, 0);
				this.currDragging.onMoveing(this.startX, this.startY, x, y);
			} else if (this.isScalingItem) {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.ctx.drawImage(this.brightMap, 0, 0);
				this.currDragging.onScaleing(this.startX, this.startY, x, y);
			}
		}
	}

	canvasMouseUp(x, y) {
		if (this.currDragging) {
			// console.log(`click up: ${this.currDragging.x}, ${this.currDragging.y}`);
			// console.log(`click up: ${this.currDragging.x}, ${this.currDragging.y}`);
			if (this.isMovingItem) {
				this.currDragging.move(this.startX, this.startY, x, y);
			} else if (this.isScalingItem) {
				this.currDragging.scale(this.startX, this.startY, x, y);
			}
			this.drawSence();
			this.currEditing  = this.currDragging;
			this.editToken(this.currDragging);
		}
		this.currDragging = undefined;
		this.addTokenGroup = undefined;
		this.addTokenType  = undefined;
	}

}
