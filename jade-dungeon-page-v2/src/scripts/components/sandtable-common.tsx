import * as React from "react";
import { ImageInfo } from "../utils/canvasGeo"
import { CURR_ENV } from './constans';

import {loadImage} from '../utils/commonUtils'

import { Observer, Canvas2dShape, CanvasLine, CanvasRectangle, CanvasCircle } from '../utils/canvasGeo';
import { defaultMapData, defaultIconData, loadDefaultIcons } from "../utils/defaultImages";
import { Point2D } from "../utils/geo2d";

const SANDTABLE_ROOT = `${CURR_ENV.apiRoot}/api/sandtable`;
type Creater = {
	id: string, type: string, x: number, y: number, x2?: number, y2?: number, 
	radius?: number, width?: number, height?: number,
	img?: {imgKey: string, sx: number, sy: number, width: number, height: number},
	color: string, visiable: boolean, blockView: boolean
};

type ImageResource = {id: string, type: string, url: string};

export type BasicResp = {status: string, msg?: string};

export type RollSettingResp = {status: string, msg: string, data?: number};

// {"status":"success","msg":"34=34(5d10)","threshold":30,"sum":34}
// {"status":"error","msg":"not your turn"}
export type RollDiceOptResp = {status: string, msg: string, threshold: number, sum: number};

// {"status":"success","msg":"","data":{"jade":{"sum":34,"msg":"34=34(5d10)","threshold":30}}}
export type RollDiceResultResp = { status: string, msg: string, data: Array<{ userId: string, threshold: number, sum: number, msg: string }> };

type TokenMoveResp = { status: string, msg: string, data: Array<{ userId: string, pos: Point2D }> };

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
	allTokens   : Array<Canvas2dShape>, 
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

let deserializeImageDatas = (tokens: Array<ImageInfo>): Array<ImageResource> => {
	let datas: Array<ImageResource> = [];
	for (let i = 0; i < tokens.length; i++) {
		let token: ImageInfo = tokens[i];
		datas.push({ "id": token.id, "type": "Image", "url": token.src });
	}
	return datas;
};

let deserializeLine = (token: CanvasLine): Creater => {
	return {
		"id": token.id, "type": "Line",
		"x": token.location.x, "y": token.location.y,
		"x2": token.end.x, "y2": token.end.y,
		"visiable": token.visiable,
		"blockView": token.blockView,
		"color": token.color
	}
};

let deserializeRect = (token: CanvasRectangle): Creater => {
	return {
		"id": token.id, "type": "Rectangle",
		"x": token.location.x, "y": token.location.y,
		"width": token.width, "height": token.height,
		"visiable": token.visiable,
		"blockView": token.blockView,
		"color": token.color,
		"img": {
			"imgKey": token.imgInfo.id,
			"sx": token.imgInfo.location.x,
			"sy": token.imgInfo.location.y,
			"width": token.imgInfo.width,
			"height": token.imgInfo.height,
		},
	}
};

let deserializeCircle = (token: CanvasCircle): Creater => {
	return {"id": token.id, "type": "Circle",
		"x": token.location.x, "y": token.location.y,
		"radius": token.radius,
		"visiable": token.visiable,
		"blockView": token.blockView,
		"color": token.color,
		"img": {
			"imgKey": token.imgInfo.id,
			"sx": token.imgInfo.location.x,
			"sy": token.imgInfo.location.y,
			"width": token.imgInfo.width,
			"height": token.imgInfo.height,
		},
	}
};

let deserializeShape = (tokens: Array<Canvas2dShape>): Array<Creater> => {
	let datas: Array<Creater> = [];
	for (let i = 0; i < tokens.length; i++) {
		let token = tokens[i];
		if (token instanceof CanvasLine     ) { datas.push(deserializeLine  (token)); } else 
		if (token instanceof CanvasRectangle) { datas.push(deserializeRect  (token)); } else 
		if (token instanceof CanvasCircle   ) { datas.push(deserializeCircle(token)); }
	}
	return datas;
}

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
		creater.color, creater.visiable, creater.blockView);
};

let json2Rectangle = async (creater: Creater, imgMap: Map<string, ImageInfo>): Promise<CanvasRectangle> => {
	let imgkey = creater.img ? creater.img.imgKey ? creater.img.imgKey : "" : "";
	let imgInfo = imgMap.get(imgkey);
	if (!imgInfo) { imgInfo = await loadDefaultIcons(); }
	return new CanvasRectangle(creater.id, { x: creater.x, y: creater.y },
		creater.width ? creater.width : 50, creater.height ? creater.height : 50, creater.color, 
		{
			id: imgInfo.id, location: { x: creater.img.sx, y: creater.img.sy },
			width: creater.img.width, height: creater.img.height, src: imgInfo.src, image: imgInfo.image 
		},
		creater.visiable, creater.blockView);
};

let json2Circle = async (creater: Creater, imgMap: Map<string, ImageInfo>): Promise<CanvasCircle> => {
	let imgkey = creater.img ? creater.img.imgKey ? creater.img.imgKey : "" : "";
	let imgInfo = imgMap.get(imgkey);
	if (!imgInfo) { imgInfo = await loadDefaultIcons(); }
	return new CanvasCircle(creater.id, { x: creater.x, y: creater.y },
		creater.radius ? creater.radius : 50, creater.color,
		{
			id: imgInfo.id, location: { x: creater.img.sx, y: creater.img.sy },
			width: creater.img.width, height: creater.img.height, src: imgInfo.src, image: imgInfo.image 
		},
		creater.visiable, creater.blockView);
};

let jsonArray2Tokens = async (imgMap: Map<string, ImageInfo>, allTokens: Array<Canvas2dShape>, tokenMap: Map<String, Canvas2dShape>, tokenList: Array<Canvas2dShape>, creaters: Array<Creater>) => {
	for (let i = 0; i < creaters.length; i++) {
		let c: Creater = creaters[i];
		let token: Canvas2dShape | undefined = undefined;
		if ('Line'      === c.type) { token =       json2Line     (c        ); } else 
		if ('Rectangle' === c.type) { token = await json2Rectangle(c, imgMap); } else 
		if ('Circle'    === c.type) { token = await json2Circle   (c, imgMap); }
		if (token) {
			tokenMap.set(token.id, token);
			tokenList.push(token);
			allTokens.push(token);
		}
	}
};

let requestMapDatas = async (campaignId: string, placeId: string, sceneId: string): Promise<ScenceResp> => {
	let resp = await fetch(`${SANDTABLE_ROOT}/load-map?campaignId=${encodeURIComponent(campaignId)}&placeId=${encodeURIComponent(placeId)}&sceneId=${encodeURIComponent(sceneId)}&t=${(new Date()).getTime()}`, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'Connection': 'keep-alive'
		},
	});
	return await resp.json();
};

export let initMapDatas = async (cvs: HTMLCanvasElement, campaignId: string, placeId: string, sceneId: string): Promise<Scence> => {
	let scene: Scence = {
		campaignId: campaignId, placeId: placeId, sceneId: sceneId,
		width: 0, height: 0, shadowColor: "rgba(0,0,0, 0.7)", viewRange: 500, allTokens: [],
		creaters: [], teams: [], walls: [], doors: [], furnitures: [], images: [],
		imageMap: new Map(), createrMap: new Map(), teamMap     : new Map(),
		wallMap : new Map(), doorMap   : new Map(), furnitureMap: new Map()
	};
	let dataResp: ScenceResp = await requestMapDatas(campaignId, placeId, sceneId);
	if ('success' == dataResp.status) {
		await json2ImageInfo(cvs, scene, dataResp.imgResources);
		await jsonArray2Tokens(scene.imageMap, scene.allTokens, scene.createrMap, scene.creaters, dataResp.mapDatas.creaters);
		await jsonArray2Tokens(scene.imageMap, scene.allTokens, scene.teamMap, scene.teams, dataResp.mapDatas.teams);
		await jsonArray2Tokens(scene.imageMap, scene.allTokens, scene.wallMap, scene.walls, dataResp.mapDatas.walls);
		await jsonArray2Tokens(scene.imageMap, scene.allTokens, scene.doorMap, scene.doors, dataResp.mapDatas.doors);
		await jsonArray2Tokens(scene.imageMap, scene.allTokens, scene.furnitureMap, scene.furnitures, dataResp.mapDatas.furnishings);
	}
	return scene;
};

export let deSerializeScene = (scence: Scence): ScenceResp => {
	//imgResources: Array<ImageResource>,
	//teams      : Array<Creater>,
	let reqJson: ScenceResp = {
		status: "success", username: "", loginToken: "",
		imgResources: deserializeImageDatas(scence.images),
		mapDatas: {
			teams      : deserializeShape(scence.teams     ), 
			creaters   : deserializeShape(scence.creaters  ), 
			furnishings: deserializeShape(scence.furnitures), 
			doors      : deserializeShape(scence.doors     ), 
			walls      : deserializeShape(scence.walls     )
		}
	};
	return reqJson;
}

export let updateMapDatas = async (campaignId: string, placeId: string, sceneId: string, jsonStr: string): Promise<BasicResp> => {
	let resp = await fetch(`${SANDTABLE_ROOT}/save-map?` + 
			`campaignId=${encodeURIComponent(campaignId)}&placeId=${encodeURIComponent(placeId)}&sceneId=${encodeURIComponent(sceneId)}` + 
			`&t=${(new Date()).getTime()}`, {
		method: 'POST',
		body: `jsonStr=${encodeURIComponent(jsonStr)}`,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Access-Control-Allow-Origin': '*',
			'Accept': 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'Connection': 'keep-alive'
		},
	});
	return await resp.json();
};


export let drawSence = async (cvs: HTMLCanvasElement, cvsCtx: CanvasRenderingContext2D, scene: Scence, observer: Observer) => {
	let map = scene.imageMap.get('map')?.image;
	cvsCtx.clearRect(0, 0, cvs.width, cvs.height);
	cvsCtx.drawImage(map, 0, 0);
	cvsCtx.fillStyle = scene.shadowColor;
	cvsCtx.fillRect(0, 0, cvs.width, cvs.height);
	let darkMap = await loadImage(new Image(), cvs.toDataURL('image/png', 1.0));
	darkMap.crossOrigin = 'Anonymous';

	cvsCtx.clearRect(0, 0, cvs.width, cvs.height);
	cvsCtx.drawImage(scene.imageMap.get('map').image, 0, 0);

	//let obs: Observer = new Observer("obs", 350, 350, 360, null);
	//observer = new Observer("obs", 350, 350, 360, null);
	observer.renderObstatlesTokenInView(cvsCtx, darkMap, scene.allTokens);

	let brightMap = await loadImage(new Image(), cvs.toDataURL('image/png', 1.0));
	brightMap.crossOrigin = 'Anonymous';

	cvsCtx.drawImage(darkMap, 0, 0);
	cvsCtx.save();
	cvsCtx.beginPath();
	cvsCtx.arc(observer.location.x, observer.location.y, observer.viewRange - 3, 0, Math.PI * 2);
	cvsCtx.clip();
	cvsCtx.drawImage(brightMap, 0, 0);
	cvsCtx.restore();
}

export let loadMoveRequest = async (scence: Scence): Promise<TokenMoveResp> => {
	let resp = await fetch(`${SANDTABLE_ROOT}/load-move-request?` + 
			`campaignId=${encodeURIComponent(scence.campaignId)}&placeId=${encodeURIComponent(scence.placeId)}&sceneId=${encodeURIComponent(scence.sceneId)}` + 
			`&t=${(new Date()).getTime()}` , {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Accept': 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'Connection': 'keep-alive'
		},
	});
	return await resp.json();
};

export let requestMoveTo = async (scence: Scence, location: Point2D, username: string): Promise<BasicResp> => {
	let resp = await fetch(`${SANDTABLE_ROOT}/request-move?` + 
			`campaignId=${encodeURIComponent(scence.campaignId)}&placeId=${encodeURIComponent(scence.placeId)}&sceneId=${encodeURIComponent(scence.sceneId)}` + 
			`&username=${encodeURIComponent(username)}&x=${location.x}&y=${location.y}` +
			`&t=${(new Date()).getTime()}`, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Accept': 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'Connection': 'keep-alive'
		},
	});
	return await resp.json();
};

export let rollDice = async (scence: Scence, username: string): Promise<RollDiceOptResp> => {
	let resp = await fetch(`${SANDTABLE_ROOT}/roll-dice?` + 
			`campaignId=${encodeURIComponent(scence.campaignId)}&placeId=${encodeURIComponent(scence.placeId)}&sceneId=${encodeURIComponent(scence.sceneId)}` + 
			`&username=${encodeURIComponent(username)}` +
			`&t=${(new Date()).getTime()}`, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Accept': 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'Connection': 'keep-alive'
		},
	});
	return await resp.json();
};

export let queryRollResult = async (scence: Scence): Promise<RollDiceResultResp> => {
	let resp = await fetch(`${SANDTABLE_ROOT}/get-roll-result?` + 
			`campaignId=${encodeURIComponent(scence.campaignId)}&placeId=${encodeURIComponent(scence.placeId)}&sceneId=${encodeURIComponent(scence.sceneId)}` + 
			`&t=${(new Date()).getTime()}`, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Accept': 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'Connection': 'keep-alive'
		},
	});
	return await resp.json();
};

export let requestRollThreshold = async (scence: Scence, username: string): Promise<RollSettingResp> => {
	let resp = await fetch(`${SANDTABLE_ROOT}/set-roll-threshold?` + 
			`campaignId=${encodeURIComponent(scence.campaignId)}&placeId=${encodeURIComponent(scence.placeId)}&sceneId=${encodeURIComponent(scence.sceneId)}` + 
			`&username=${encodeURIComponent(username)}` +
			`&t=${(new Date()).getTime()}`, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Accept': 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'Connection': 'keep-alive'
		},
	});
	return await resp.json();
};

export let queryCampaignOwner = async (campaignId: string): Promise<void> => {
	let resp = await fetch(`${SANDTABLE_ROOT}/map-owner?campaignId=${encodeURIComponent(campaignId)}&t=${(new Date()).getTime()}`, {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Accept': 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'Connection': 'keep-alive'
		},
	});
	return await resp.json();
};
