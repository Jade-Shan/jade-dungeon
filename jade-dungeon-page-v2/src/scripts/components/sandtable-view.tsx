import {loadDefaultImage} from '../utils/defaultImages'
import { Canvas2dShape, CanvasCircle, Observer } from '../utils/canvasGeo';
import { Point2D } from '../utils/geo2d';
import { loadImage } from '../utils/commonUtils';

import * as STCom from './sandtable-common'; // Sandtable common

import * as FWin from '../ui/floatWin';
import { WIN_ID_DIC } from '../pages/sandtable-view';
import React = require('react');

type FrameBuffer = {
	viewMap    : CanvasImageSource,
	teamMoveMap: CanvasImageSource,
	userMoveMap: CanvasImageSource,
}

export let initSandtable = async (document: Document, cvs: HTMLCanvasElement, cvsCtx: CanvasRenderingContext2D, buffer: HTMLCanvasElement, bufferCtx: CanvasRenderingContext2D): Promise<void> => {
	let username = 'jade';
	// username  = cookieOperator('username');
	let scene: STCom.Scence = await STCom.initMapDatas(buffer, 'campaign01', 'place01', 'scene01');
	cvs.width  = buffer.width ;
	cvs.height = buffer.height;
	let observer = await findObserverOnMap(scene, username);

	let fb: FrameBuffer = {
		viewMap    : new Image(),
		teamMoveMap: new Image(),
		userMoveMap: new Image(),
	}

	fb.viewMap = await STCom.drawSence(buffer, bufferCtx, scene, observer);

	let status: UIStatus = {
		start: { x: 0, y: 0 },
		isMovingItem: false,
		currDragging: undefined,
		reqMoveDst: undefined,
		addTokenType: undefined,
		addTokenGroup: undefined
	};

	// 没有画上当前玩家移动请求的那一帧，因为拖动的时候还会改
	fb.teamMoveMap = await showWantMoveTo(cvs, buffer, bufferCtx, fb.viewMap, scene, status, username);
	// 画上当前玩家移动请求的那一帧
	fb.userMoveMap = await loadImage(new Image(), buffer.toDataURL('image/png', 1.0));
	// 把缓存中的内容画到显示的画布上
	cvsCtx.drawImage(fb.userMoveMap, 0, 0);

	// 绑定鼠标拖动操作
	await bindCanvasPressCtrl(document, status);
	await bindCanvasMouseDown(cvs, cvs, cvsCtx, fb.teamMoveMap, scene, status, username);
	await bindCanvasMouseUp  (cvs, cvs, cvsCtx, fb.teamMoveMap, scene, status, username);
	await bindCanvasMouseDrag(cvs, cvs, cvsCtx, fb.teamMoveMap, scene, status, username);

	// 绑定提交roll操作
	let rollIpt = document.getElementById('ipt-roll') as HTMLInputElement;
	bindRollDiceReq(rollIpt, scene, username);

	// 刷新roll记录
	let refreshDiceLog = async () => {
		let html = await queryRollResult(scene);
		let log = document.getElementById(FWin.getWinScaleBodyId(WIN_ID_DIC));
		log.innerHTML = html;
	};

	let refreshMoveRequest = async () => {
		// 没有画上当前玩家移动请求的那一帧，因为拖动的时候还会改
		fb.teamMoveMap = await showWantMoveTo(cvs, buffer, bufferCtx, fb.viewMap, scene, status, username);
		// 画上当前玩家移动请求的那一帧
		fb.userMoveMap = await loadImage(new Image(), buffer.toDataURL('image/png', 1.0));
		// 把缓存中的内容画到显示的画布上
		cvsCtx.drawImage(fb.userMoveMap, 0, 0);
	};

	await refreshDiceLog();
	await refreshMoveRequest();
	setInterval(()=> {
		refreshDiceLog();
		refreshMoveRequest();
	}, 10000);
};

let findObserverOnMap = async (scene: STCom.Scence, userId: string): Promise<Observer> => {
	let obtm: Canvas2dShape = new CanvasCircle('spectator', { x: 10, y: 10 }, 50, 
		scene.shadowColor, await loadDefaultImage(), false, false);
	if (scene.teams) {
		let l1 = scene.teams.filter((e) => { return e.id == userId; });
		let l2 = scene.teams.filter((e) => { return e.id == 'spectator'; });
		if (l1.length > 0) {
			obtm = l1[0];
		} else if (l2.length > 0) {
			obtm = l2[0];
		}
	}
	obtm.blockView = false;
	obtm.visiable  = true ;

	return new Observer("obs", obtm.location.x, obtm.location.y, scene.viewRange, obtm);
};

let showWantMoveTo = async (cvs: HTMLCanvasElement, buffer: HTMLCanvasElement, bufferCtx: CanvasRenderingContext2D, viewMap: CanvasImageSource, scence: STCom.Scence, status: UIStatus, username: string) => {
	bufferCtx.drawImage(viewMap, 0, 0);
	let resp: STCom.TokenMoveResp = await STCom.loadMoveRequest(scence);
	// console.log(resp);
	let userMovePos: Point2D = null; 
	let userToken: Canvas2dShape = null;
	if (resp.data && resp.data.length > 0) {
		for (let i=0; i< resp.data.length; i++) {
			let rec = resp.data[i];
			let token = scence.teamMap.get(rec.userId);
			if (rec.userId == username) {
				status.currDragging = token;
				status.start.x = token.location.x;
				status.start.y = token.location.y;
				userMovePos = rec.pos;
				userToken   = token;
			} else {
				token.drawWantMove(bufferCtx, token.location, rec.pos);
			}
		}
	}
	let newImage = await loadImage(new Image(), buffer.toDataURL('image/png', 1.0));
	if (userToken && userMovePos) {
		userToken.drawWantMove(bufferCtx, userToken.location, userMovePos);
	}
	return newImage;
}

let moveObs = (observer: Observer, dx: number, dy: number) => {
	observer.location.x  += dx;
	observer.location.y  += dy;
	observer.body.location.x += dx;
	observer.body.location.y += dy;
};

let caculateNodeOffset  = (node: HTMLElement, location: Point2D): Point2D => {
	location.x += node.offsetLeft - node.scrollLeft;
	location.y += node.offsetTop  - node.scrollTop;

	let parent: HTMLElement  = node.offsetParent as HTMLElement;
	return parent ? caculateNodeOffset(parent, location) : location;
};

let rollDice = async (scene: STCom.Scence, rollCmd: string, username: string) => {
	if (rollCmd && rollCmd.length > 0) {
		let resp: STCom.RollDiceOptResp = await STCom.rollDice(scene, rollCmd, username);
		console.log(resp);
	} else {
		alert('请输入Roll命令');
	}
};

export let queryRollResult = async (scene: STCom.Scence) => {
	// let username = cookieOperator('username');
	let resp: STCom.RollDiceResultResp = await STCom.queryRollResult(scene);
	let text = "<dl>";
	if (resp && resp.data) {
		for (let i = 0; i < resp.data.length; i++) {
			let rec = resp.data[i];
			let statusText  = "";
			let statusClass = "";
			let msgDetail   = "";
			if (rec.sum > 0 && rec.sum < rec.threshold) {
				statusText = "失败";
				statusClass = "badge bg-danger";
				msgDetail = rec.msg;
			} else if (rec.sum > 0) {
				statusText = "成功";
				statusClass = "badge bg-success";
				msgDetail = rec.msg;
			} else {
				statusText = "等待";
				statusClass = "badge bg-secondary";
				msgDetail = "尚未投骰子……";
			}
			text = text + `<dt>${rec.userId}：检定难度（${rec.threshold}）<span class="${statusClass}">${statusText}</span>：</dt>`;
			text = text + `<dd>${msgDetail}</dd>`;
		}
	}
	text = text + "</dl>";
	// console.log(text);
	return text;
};

export type UIStatus = { 
	start        : Point2D, 
	isMovingItem : boolean, 
	currDragging : Canvas2dShape,
	reqMoveDst   : Canvas2dShape,
	addTokenType : any,
	addTokenGroup: any 
};

// 按住Ctrl拖动棋子
let bindCanvasPressCtrl = (element: Document, status: UIStatus) => {
	console.log('bind control');
	element.addEventListener('keydown', (e: KeyboardEvent) => {
		if (e.key == 'Control') { status.isMovingItem = true ;}
	});
	element.addEventListener('keyup'  , (e: KeyboardEvent) => {
		if (e.key == 'Control') { status.isMovingItem = false;}
	});
};

// 绑定输入框中按回车提交投骰子的请求
let bindRollDiceReq = (input: HTMLInputElement, scene: STCom.Scence, username: string) => {
	input.addEventListener('keydown', (e: KeyboardEvent) => {
		if (e.key == 'Enter') { rollDice(scene, input.value, username); }
		// if (e.key == 'Enter') { console.log(input.value); }
	});
};

// 绑定鼠标操作
let bindCanvasMouseDown = (cvs: HTMLCanvasElement, buffer: HTMLCanvasElement, bufferCtx: CanvasRenderingContext2D, viewMap: CanvasImageSource, scene: STCom.Scence, status: UIStatus, username: string) => {
	buffer.addEventListener('mousedown', (e: MouseEvent) => {
		let offset = caculateNodeOffset(cvs, { x: 0, y: 0 });
		status.start.x = e.pageX - offset.x;
		status.start.y = e.pageY - offset.y;
		status.currDragging = undefined;
		for (let i = 0; i < scene.teams.length; i++) {
			let token = scene.teams[i];
			if (token.isHit(status.start) && token.id == username) {
				// console.log(`hit: ${token.id}`);
				status.currDragging = token;
				break;
			}
		}
		if (status.reqMoveDst && status.reqMoveDst.isHit(status.start)) {
			// 撤消移动
			let resp: Promise<STCom.BasicResp> = STCom.requestMoveTo(scene, {x: -1, y: -1}, username); 
			bufferCtx.clearRect(0, 0, buffer.width, buffer.height);
			bufferCtx.drawImage(viewMap, 0, 0);
		}
	});
};

let bindCanvasMouseUp   = (cvs: HTMLCanvasElement, buffer: HTMLCanvasElement, bufferCtx: CanvasRenderingContext2D, viewMap: CanvasImageSource, scene: STCom.Scence, status: UIStatus, username: string) => {
	buffer.addEventListener('mouseup'  , (e: MouseEvent) => {
		let offset = caculateNodeOffset(cvs, { x: 0, y: 0 });
		let location = { x: e.pageX - offset.x, y: e.pageY - offset.y }
		if (status.currDragging && status.isMovingItem) {
			let resp: Promise<STCom.BasicResp> = STCom.requestMoveTo(scene, location, username); 
			console.log(resp);
		}
		status.isMovingItem  = false;
		status.currDragging  = undefined;
		status.addTokenGroup = undefined;
		status.addTokenType  = undefined;
	});
};

let bindCanvasMouseDrag = (cvs: HTMLCanvasElement, buffer: HTMLCanvasElement, bufferCtx: CanvasRenderingContext2D, viewMap: CanvasImageSource, scene: STCom.Scence, status: UIStatus, username: string) => {
	buffer.addEventListener('mousemove'  , (e: MouseEvent) => {
		let offset = caculateNodeOffset(cvs, { x: 0, y: 0 });
		let location = { x: e.pageX - offset.x, y: e.pageY - offset.y }
		if (status.currDragging && status.isMovingItem) {
			bufferCtx.clearRect(0, 0, buffer.width, buffer.height);
			bufferCtx.drawImage(viewMap, 0, 0);
			status.reqMoveDst = status.currDragging.drawWantMove(bufferCtx, status.start, location);
		}
	});
};
