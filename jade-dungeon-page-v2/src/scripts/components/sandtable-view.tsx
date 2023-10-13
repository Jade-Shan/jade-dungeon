import {defaultImgData, loadDefaultImage} from '../utils/defaultImages'
import { Canvas2dShape, CanvasCircle, ImageInfo, Observer } from '../utils/canvasGeo';
import * as STCom from './sandtable-common'; // Sandtable common
import { Point2D } from '../utils/geo2d';
import { cookieOperator } from '../utils/commonUtils';


export let initSandtable = async (cvs: HTMLCanvasElement, cvsCtx: CanvasRenderingContext2D): Promise<void> => {
	let scene: STCom.Scence = await STCom.initMapDatas(cvs, 'campaign01', 'place01', 'scene01');
	let observer = await findObserverOnMap(scene, 'jade');
	await STCom.drawSence(cvs, cvsCtx, scene, observer);
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
		let resp: STCom.RollDiceOptResp = await STCom.rollDice(scene, username);
		console.log(resp);
	} else {
		alert('请输入Roll命令');
	}
};

let queryRollResult = async (scene: STCom.Scence) => {
	// let username = cookieOperator('username');
	let resp: STCom.RollDiceResultResp = await STCom.queryRollResult(scene);
	let text = "";
	if (resp && resp.data) {
		for (let i = 0; i < resp.data.length; i++) {
			let rec = resp.data[i];
			let threshold = rec.threshold;
			let sum = rec.sum;
			let msg = rec.msg;
			text = `${text} * ${rec.userId}    `;
			if (sum > 0 && sum < threshold) {
				text = `${text}   失败：${msg}\n`;
			} else if (sum > 0) {
				text = `${text}   成功：${msg}\n`;
			} else {
				text = '${text}  等待中……\n';
			}
		}
	}
	console.log(text);
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
let bindCanvasPressCtrl = (element: HTMLElement, status: UIStatus) => {
	element.addEventListener('keydown', (e: KeyboardEvent) => {
		if (e.key == 'Control') { status.isMovingItem = true ; }
	});
	element.addEventListener('keyup'  , (e: KeyboardEvent) => {
		if (e.key == 'Control') { status.isMovingItem = false; }
	});
};

// 绑定输入框中按回车提交投骰子的请求
let bindRollDiceReq = (element: HTMLElement, scene: STCom.Scence, rollCmd: string, username: string) => {
	element.addEventListener('keydown', (e: KeyboardEvent) => {
		if (e.key == 'Enter') { rollDice(scene, rollCmd, username); }
	});
};

// 绑定鼠标操作
let bindCanvasMouseDown = (cvs: HTMLCanvasElement, buffer: HTMLCanvasElement, bufferCtx: CanvasRenderingContext2D, viewMap: CanvasImageSource, scene: STCom.Scence, status: UIStatus, username: string) => {
	buffer.addEventListener('mousedown', (e: MouseEvent) => {
		let offset = caculateNodeOffset(cvs, { x: 0, y: 0 });
		let location = { x: e.pageX - offset.x, y: e.pageY - offset.y }
		status.currDragging = undefined;
		for (let i = 0; i < scene.teams.length; i++) {
			let token = scene.teams[i];
			if (token.isHit(location) && token.id == username) {
				// console.log(`hit: ${token.id}`);
				status.currDragging = token;
				break;
			}
		}
		if (status.reqMoveDst && status.reqMoveDst.isHit(location)) {
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
			let resp: Promise<STCom.BasicResp> = STCom.requestMoveTo(scene, status.reqMoveDst.location, username); 
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