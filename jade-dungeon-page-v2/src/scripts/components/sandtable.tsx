import * as React from "react";
import {CURR_ENV} from './constans';

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

export let requestMapDatas = async (campaignId: string, placeId: string, sceneId: string): Promise<Response> => {
	return fetch(`${SANDTABLE_ROOT}/load-map?campaignId=${encodeURIComponent(campaignId)}&placeId=${encodeURIComponent(placeId)}&sceneId=${encodeURIComponent(sceneId)}&t=${(new Date()).getTime()}`, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Accept-Encoding': 'gzip, deflate',
			'Connection': 'keep-alive'
		},
		/*
	}).then((response) => response.json()).then((data) => {
		console.log(data);
	}).catch((err) => {
		console.log(err.message);
		*/
	});
};