import * as STCom from './sandtable-common'; // Sandtable common


export let initSandtable = async (cvs: HTMLCanvasElement, cvsCtx: CanvasRenderingContext2D): Promise<void> => {
	let scene: STCom.Scence = await STCom.initMapDatas(cvs, 'campaign01', 'place01', 'scene01');
	await STCom.drawSence(cvs, cvsCtx, scene);
}