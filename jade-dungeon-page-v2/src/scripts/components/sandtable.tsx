import * as React from "react";
import { ImageInfo } from "../utils/canvasGeo"
import { CURR_ENV } from './constans';

import { Canvas2dShape, CanvasLine, CanvasRectangle, CanvasCircle, loadImage } from '../utils/canvasGeo';
import { defaultMapData, defaultIconData, loadDefaultIcons } from "../utils/defaultImages";

const SANDTABLE_ROOT = `${CURR_ENV.apiRoot}/api/sandtable`;
type Creater = {
	id: string, type: string, x: number, y: number, x2?: number, y2?: number, 
	radius?: number, width?: number, height?: number,
	img?: {imgKey: string, sx: number, sy: number, width: number, height: number},
	color: string, visible: boolean, blockView: boolean
};

type ImageResource = {id: string, type: string, url: string};

type ScenceResp = {
	status    : string,
	username  : string,
	loginToken: string,
	imgResources: Array<ImageResource>,
	mapDatas  : {
		teams      : Array<Creater>,
		creaters   : Array<Creater>,
		furnishings: Array<Creater>,
		doors      : Array<Creater>,
		walls      : Array<Creater>
	} 
};

export type Scence = { 
	campaignId: string, placeId: string, sceneId: string,
	width: number, height: number, shadowColor: string, viewRange: number,
	images      : Array<ImageInfo>,
	creaters    : Array<Canvas2dShape>, 
	teams       : Array<Canvas2dShape>, 
	walls       : Array<Canvas2dShape>, 
	doors       : Array<Canvas2dShape>, 
	furnitures  : Array<Canvas2dShape>, 
	imageMap    : Map<string, ImageInfo>,
	createrMap  : Map<string, Canvas2dShape>, 
	teamMap     : Map<string, Canvas2dShape>, 
	wallMap     : Map<string, Canvas2dShape>, 
	doorMap     : Map<string, Canvas2dShape>, 
	furnitureMap: Map<string, Canvas2dShape>, 
};

let json2ImageInfo = async (cvs: HTMLCanvasElement, scene: Scence, imgResources: Array<ImageResource>) => {
	for (let i = 0; i < imgResources.length; i++) {
		let imgRes: ImageResource = imgResources[i];
		let fallbackBase64: string = 'map' == imgRes.id ? defaultMapData : defaultIconData;
		let img: HTMLImageElement = await loadImage(new Image(), imgRes.url, fallbackBase64);
		let imgInfo: ImageInfo = { id: imgRes.id, location: { x: 0, y: 0 },
			width: img.width, height: img.height, src: imgRes.url, image: img };
		scene.imageMap.set(imgInfo.id, imgInfo);
		scene.images  .push(imgInfo);
		if ('map' == imgRes.id) {
			cvs.width  = img.width;
			cvs.height = img.height;
		}
	}
};

let json2Line = (creater: Creater): CanvasLine => {
	return new CanvasLine(creater.id, { x: creater.x, y: creater.y },
		{ x: creater.x2 ? creater.x2 : 0, y: creater.y2 ? creater.y2 : 0 },
		creater.color, creater.visible, creater.blockView);
};

let json2Rectangle = async (creater: Creater, imgMap: Map<string, ImageInfo>): Promise<CanvasRectangle> => {
	let imgkey = creater.img ? creater.img.imgKey ? creater.img.imgKey : "" : "";
	let imgInfo = imgMap.get(imgkey);
	if (!imgInfo) { imgInfo = await loadDefaultIcons(); }
	return new CanvasRectangle(creater.id, { x: creater.x, y: creater.y },
		creater.width ? creater.width : 50, creater.height ? creater.height : 50,
		creater.color, imgInfo,
		creater.visible, creater.blockView);
};

let json2Circle = async (creater: Creater, imgMap: Map<string, ImageInfo>): Promise<CanvasCircle> => {
	let imgkey = creater.img ? creater.img.imgKey ? creater.img.imgKey : "" : "";
	let imgInfo = imgMap.get(imgkey);
	if (!imgInfo) { imgInfo = await loadDefaultIcons(); }
	return new CanvasCircle(creater.id, { x: creater.x, y: creater.y },
		creater.radius ? creater.radius : 50, creater.color, imgInfo,
		creater.visible, creater.blockView);
};

let jsonArray2Tokens = async (imgMap: Map<string, ImageInfo>, tokenMap: Map<String, Canvas2dShape>, tokenList: Array<Canvas2dShape>, creaters: Array<Creater>) => {
	for (let i = 0; i < creaters.length; i++) {
		let c: Creater = creaters[i];
		let token: Canvas2dShape | undefined = undefined;
		if ('Line'      === c.type) { token = json2Line     (c); } else 
		if ('Rectangle' === c.type) { token = await json2Rectangle(c, imgMap); } else 
		if ('Circle'    === c.type) { token = await json2Circle   (c, imgMap); }
		if (token) {
			tokenMap.set(token.id, token);
			tokenList.push(token);
		}
	}
};

let requestMapDatas = async (campaignId: string, placeId: string, sceneId: string): Promise<Response> => {
	return fetch(`${SANDTABLE_ROOT}/load-map?campaignId=${encodeURIComponent(campaignId)}&placeId=${encodeURIComponent(placeId)}&sceneId=${encodeURIComponent(sceneId)}&t=${(new Date()).getTime()}`, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'Connection': 'keep-alive'
		},
	});
};

export let initMapDatas = async (cvs: HTMLCanvasElement, campaignId: string, placeId: string, sceneId: string): Promise<Scence> => {
	let scene: Scence = {
		campaignId: campaignId, placeId: placeId, sceneId: sceneId,
		width: 0, height: 0, shadowColor: "rgba(0,0,0, 0.7)", viewRange: 500,
		creaters: [], teams: [], walls: [], doors: [], furnitures: [], images: [],
		imageMap: new Map(), createrMap: new Map(), teamMap     : new Map(),
		wallMap : new Map(), doorMap   : new Map(), furnitureMap: new Map()
	};

	await requestMapDatas(campaignId, placeId, sceneId).then((response) => response.json()).then(async (data) => {
		console.log(data);
		let dataResp: ScenceResp = data;

		await json2ImageInfo(cvs, scene, dataResp.imgResources);
		await jsonArray2Tokens(scene.imageMap, scene.createrMap  , scene.creaters  , dataResp.mapDatas.creaters   );
		await jsonArray2Tokens(scene.imageMap, scene.teamMap     , scene.teams     , dataResp.mapDatas.teams      );
		await jsonArray2Tokens(scene.imageMap, scene.wallMap     , scene.walls     , dataResp.mapDatas.walls      );
		await jsonArray2Tokens(scene.imageMap, scene.doorMap     , scene.doors     , dataResp.mapDatas.doors      );
		await jsonArray2Tokens(scene.imageMap, scene.furnitureMap, scene.furnitures, dataResp.mapDatas.furnishings);
	}).catch((err) => {
		console.log(err.message);
	});

	return scene;
};

export let drawSence = async (cvs: HTMLCanvasElement, cvsCtx: CanvasRenderingContext2D, scene: Scence) => {
	let map = scene.imageMap.get('map')?.image;
	cvsCtx.clearRect(0, 0, cvs.width, cvs.height);
	cvsCtx.drawImage(map, 0, 0);
	cvsCtx.fillStyle = scene.shadowColor;
	cvsCtx.fillRect(0, 0, cvs.width, cvs.height);
	let darkMap = await loadImage(new Image(), cvs.toDataURL('image/png', 1.0));
	darkMap.crossOrigin = 'Anonymous';

	cvsCtx.clearRect(0, 0, cvs.width, cvs.height);
	cvsCtx.drawImage(scene.imageMap.get('map').image, 0, 0);

}