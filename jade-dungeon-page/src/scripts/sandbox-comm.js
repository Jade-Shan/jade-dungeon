/* jshint esversion: 8 */
let imgResources = [];
let mapDatas     = [];
let scene  = {
	width: 0, height: 0, lighteness: 'rgba(0, 0, 0, 0.7)',
	creaters : [], teams: [], walls: [], doors: [], furnishing: [], images:{}};
let observer = {};

let viewRange = 500;

let canvas = document.getElementById("canvas");
let ctx    = canvas.getContext("2d");

let loadImage = async (image, imageURL) => {
	return new Promise((resolve, reject) => {
		image.onload  = () => { 
			resolve(image, imageURL); 
		};
		image.onabort = () => { 
			reject(image, imageURL); 
		};
		image.onerror = () => { 
			reject(image, imageURL); 
		};
		image.src = imageURL;
		image.crossOrigin='Anonymous';
	});
};

let sleepMS = async (ms) =>  {
	return new Promise((resolve, reject) => {
		setTimeout(() => { resolve(); }, ms);
	});
};

let requestMapDatas = async (campaignId, placeId, sceneId) => {
	return new Promise((resolve, reject) => {
		$.ajax({ 
			url: encodeURI(apiRoot + "maps/" + campaignId + "/" + placeId + "/" + sceneId), 
			type: 'GET', dataType: 'json', data: { },
			timeout: 30000,
			success: function(data, status, xhr) {
				if ('success' == data.status) {
					// console.log(data);
					resolve(data);
				} else { reject(data); }
			},
			error: function(xhr, errorType, error) { reject(xhr); },
			complete: function(xhr, status) { }
		});
	});
};

