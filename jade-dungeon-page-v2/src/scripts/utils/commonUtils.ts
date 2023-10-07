import { CURR_ENV } from "../components/constans";
import { defaultImgData } from './defaultImages';

const IMG_CACHE_PREFIX: string = 'cache-img-base64-';
const IMG_CACHE_TIMEOUT: number = 1000 * 60 * 60;

type ImageCache = {url: string, time: number, data: string};

let fetchImage = async (url: string, fallbackBase64?: string): Promise<string> => {
	let imgBase64 = fallbackBase64 ? fallbackBase64 : defaultImgData;
	if (url.indexOf('data:image/') == 0) {
		imgBase64 = url;
	} else {
		let callURL = url; 
		if (url.indexOf('http') == 0) {
			callURL = `${CURR_ENV.apiRoot}/api/sandtable/parseImage?src=${encodeURIComponent(url)}`;
		}
		let resp: Response = await fetch(callURL, {
			method: 'GET',
			headers: {
				'Accept': 'image/avif,image/webp,*/*',
				'Accept-Encoding': 'gzip, deflate',
				'Accept-Language': 'en-US,en;q=0.5',
				//'Access-Control-Allow-Headers': '*',
				//'Access-Control-Allow-Origin': '*',
				'Connection': 'keep-alive',
				//'Cache-Control': 'max-age=3600'
			},
		});
		if (resp) {
			let getBuffer = (resp: Response) => { return resp.arrayBuffer(); };
			let buffer: ArrayBuffer = await getBuffer(resp);
			let imgBase64Src = transArrayBufferToBase64(buffer);
			imgBase64 = 'data:image/png;base64,' + imgBase64Src;
			localStorage.setItem(IMG_CACHE_PREFIX + url, JSON.stringify({ url: url, time: (new Date()).getTime(), data: imgBase64 }));
		}
	}
	return imgBase64;
};

let loadImageCache = (url: string) => {
	let data = '';
	try {
		let str = localStorage.getItem(IMG_CACHE_PREFIX + url);
		if (str) {
			let c: ImageCache = JSON.parse(str);
			if ((c.time + IMG_CACHE_TIMEOUT) > (new Date()).getTime()) {
				data = c.data;
			}
		}
	} catch (error) {
		// 	
	}
	return data;
};

let fetchImageWithCache = async (url: string, fallbackBase64?: string) => {
	let imgBase64 = loadImageCache(url);
	if (!imgBase64 || imgBase64.length < 20) {
		imgBase64 = await fetchImage(url, fallbackBase64);
	}
	return imgBase64;
}

let transArrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa( binary );
};

export let loadImage = async (image: HTMLImageElement, imgSrcURL: string, fallbackBase64?: string): Promise<HTMLImageElement> => {
	//let imgBase64 = await fetchImage(imgSrcURL, fallbackBase64);
	let imgBase64 = await fetchImageWithCache(imgSrcURL, fallbackBase64);
	let pm = new Promise((
		resolve: (rp: { image: HTMLImageElement, url: string }) => any,
		reject : (jp: { image: HTMLImageElement, url: string }) => any
	) => {
		image.src = imgBase64;
		image.crossOrigin = 'Anonymous';
		image.onload  = () => { resolve({ image: image, url: imgBase64 }); };
		image.onabort = () => { reject ({ image: image, url: imgBase64 }); };
		image.onerror = () => { reject ({ image: image, url: imgBase64 }); };
	});
	return await pm.then(rp => rp.image).catch(async jp => {
		console.log(`load image err: ${imgBase64}`);
		image.src = fallbackBase64 ? fallbackBase64 : defaultImgData;
		image.crossOrigin = 'Anonymous';
		let errPm = new Promise((
			resolve: (rp: { image: HTMLImageElement, url: string }) => any,
			reject : (jp: { image: HTMLImageElement, url: string }) => any
		) => {
			image.onload  = () => { resolve({ image: image, url: imgBase64 }); };
			image.onabort = () => { reject ({ image: image, url: imgBase64 }); };
			image.onerror = () => { reject ({ image: image, url: imgBase64 }); };
		});
		return await errPm.then(rp => rp.image).catch(jp => { return image; });
	});
};

export let loadImage_old_version = async (image: HTMLImageElement, url: string, fallbackBase64?: string): Promise<HTMLImageElement> => {
	// console.log(url);
	if (url.indexOf('http') == 0) {
		let encodeSrc = encodeURIComponent(url);
		url = `${CURR_ENV.apiRoot}/api/sandtable/parseImage?src=${encodeSrc}`;
	}
	let pm = new Promise((
		resolve: (rp: { image: HTMLImageElement, url: string }) => any,
		reject : (jp: { image: HTMLImageElement, url: string }) => any
	) => {
		image.src = url;
		image.crossOrigin = 'Anonymous';
		image.onload  = () => { resolve({ image: image, url: url }); };
		image.onabort = () => { reject ({ image: image, url: url }); };
		image.onerror = () => { reject ({ image: image, url: url }); };
	});
	return await pm.then(rp => rp.image).catch(async jp => {
		console.log(`load image err: ${url}`);
		image.src = fallbackBase64 ? fallbackBase64 : defaultImgData;
		image.crossOrigin = 'Anonymous';
		let errPm = new Promise((
			resolve: (rp: { image: HTMLImageElement, url: string }) => any,
			reject : (jp: { image: HTMLImageElement, url: string }) => any
		) => {
			image.onload  = () => { resolve({ image: image, url: url }); };
			image.onabort = () => { reject ({ image: image, url: url }); };
			image.onerror = () => { reject ({ image: image, url: url }); };
		});
		return await errPm.then(rp => rp.image).catch(jp => { return image; });
	});
};



let cookieOperator = (name: string, value: string, options: any) => {
	if (typeof value != 'undefined') {
		options = options || {};
		if (value === null) {
			value = '';
			options.expires = -1;
		}
		var expires = '';
		if (options.expires &&
			(typeof options.expires == 'number' || options.expires.toUTCString)) {
			var date;
			if (typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			expires = ';expires=' + date.toUTCString();
		}
		var path = options.path ? ';path=' + options.path : '';
		var domain = options.domain ? ';domain=' + options.domain : '';
		var secure = options.secure ? ';secure' : '';
		var sameSite = options.SameSite ? ';SameSite=' + options.SameSite : '';
		let concatStr = [name, '=', encodeURIComponent(value), expires, path, domain, sameSite, secure].join('');
		console.log(concatStr);
		document.cookie = concatStr;
	} else {
		var cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = cookies[i].trim();
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
};

export let parseUrlParams = (): Map<string, string|Array<string>> => {
	let params: Map<string, string|Array<string>> = new Map();
	if (document.location.search.length > 1) {
		let paramStr = document.location.search.substring(1);
		let strArr = paramStr.split('&');
		for (let i = 0; i < strArr.length; i++) {
			let kvArr = strArr[i].split('=');
			let key   = decodeURIComponent(kvArr[0]);
			let value = decodeURIComponent(kvArr[1]);
			if (params.has(key)) {
				let oldValue = params.get(key);
				if (oldValue instanceof Array) {
					oldValue.push(value);
				} else {
					params.set(key, [oldValue, value]);
				}
			} else {
				params.set(key, value);
			}
		}
	}
	return params;
};
