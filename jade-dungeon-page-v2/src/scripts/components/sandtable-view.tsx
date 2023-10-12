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
		let resp: STCom.RollDiceOptResp = await STCom.rollDice(scene.campaignId, scene.placeId, scene.sceneId, username);
		console.log(resp);
	} else {
		alert('请输入Roll命令');
	}
};

let queryRollResult = async (scene: STCom.Scence) => {
	// let username = cookieOperator('username');
	let resp: STCom.RollDiceResultResp = await STCom.queryRollResult(scene.campaignId, scene.placeId, scene.sceneId);
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

export type UIStatus = { start: Point2D, end: Point2D, isMovingItem: boolean };

