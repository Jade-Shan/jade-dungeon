import * as React from "react";
import { ImageInfo } from "../utils/geo2d"
import {CURR_ENV} from './constans';

import { Canvas2dShape, CanvasLine, CanvasRectangle, CanvasCircle, loadImage } from '../utils/canvasGeo';
import { loadDefaultIcons, loadDefaultMap } from "../utils/defaultImages";

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

let json2ImageInfo = async (imgMap: Map<string, ImageInfo>, imgResources: Array<ImageResource>) => {
	for (let i = 0; i < imgResources.length; i++) {
		let imgRes: ImageResource = imgResources[i];
		let img: HTMLImageElement = await loadImage(new Image(), imgRes.url);
		let imgInfo: ImageInfo = { id: imgRes.id, location: { x: 0, y: 0 },
			width: img.width, height: img.height, src: imgRes.url, image: img };
		imgMap.set(imgInfo.id, imgInfo);
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

export let initMapDatas = async (campaignId: string, placeId: string, sceneId: string) => {
	await requestMapDatas(campaignId, placeId, sceneId).then((response) => response.json()).then((data) => {
		console.log(data);
		let scence: ScenceResp = data;
	}).catch((err) => {
		console.log(err.message);
	});
}