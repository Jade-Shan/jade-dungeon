import {defaultImgData, loadDefaultImage} from '../utils/defaultImages'
import { Canvas2dShape, CanvasCircle, ImageInfo, Observer } from '../utils/canvasGeo';
import * as STCom from './sandtable-common'; // Sandtable common


export let initSandtable = async (cvs: HTMLCanvasElement, cvsCtx: CanvasRenderingContext2D): Promise<void> => {
	let scene: STCom.Scence = await STCom.initMapDatas(cvs, 'campaign01', 'place01', 'scene01');
	let observer = await findObserverOnMap(scene, 'jade');
	await STCom.drawSence(cvs, cvsCtx, scene, observer);
};

let findObserverOnMap = async (scene: STCom.Scence, userId: string) => {
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
}

