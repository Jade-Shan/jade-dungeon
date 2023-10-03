import { distanceP2P, Point2D, Ray, Line, Rectangle, Circle, ImageInfo, Shape2D } from './geo2d';
import { PI_DOUBLE, PI_ONE_HALF, PI_HALF } from './geo2d';

import {defaultImgData} from "../utils/defaultImages";

export type DrawStyle = {lineWidth?: number, strokeStyle?: string, fillStyle?: string};

let applyStyle = (cvsCtx: CanvasRenderingContext2D, style?: DrawStyle) => {
	if (style) {
		if (style.fillStyle  ) { cvsCtx.fillStyle   = style.fillStyle  ; }
		if (style.strokeStyle) { cvsCtx.strokeStyle = style.strokeStyle; }
		if (style.lineWidth  ) { cvsCtx.lineWidth   = style.lineWidth  ; }
	}
}

let drawLines = (cvsCtx: CanvasRenderingContext2D, rays: Array<Ray>) => {
	cvsCtx.save();
	applyStyle(cvsCtx, { lineWidth: 2, strokeStyle: 'rgba(255, 0, 0, 0.7)' });
	if (rays) {
		rays.forEach(r => {
			cvsCtx.beginPath();
			cvsCtx.moveTo(r.start.x, r.start.y);
			cvsCtx.lineTo(r.end.x, r.end.y);
			cvsCtx.stroke();
		});
	}
	cvsCtx.restore();
}


export let loadImage = async (image: HTMLImageElement, url: string): Promise<HTMLImageElement> => {
	// console.log(url);
	if (url.indexOf('http') == 0) {
		let encodeSrc = encodeURIComponent(url);
		// url = 'http://localhost:8088/api/sandtable/parseImage?src=' + encodeSrc;
		url = 'http://www.jade-dungeon.net:8088/api/sandtable/parseImage?src=' + encodeSrc;
	}
	let pm = new Promise((resolve: (rp: {image: HTMLImageElement, url: string}) => any, reject: (jp: {image: HTMLImageElement, url: string}) => any) => {
		image.src = url;
		image.crossOrigin='Anonymous';
		// image.crossorigin='anonymous';
		// image.crossOrigin = "anonymous";
		// image.setAttribute('crossOrigin', 'anonymous');
		// image.setAttribute('crossorigin', 'anonymous');
		image.onload  = () => { resolve({image: image, url: url}); };
		image.onabort = () => { reject ({image: image, url: url}); };
		image.onerror = () => { reject ({image: image, url: url}); };
	});
	return await pm.then(rp => rp.image).catch(async jp => {
		console.log(`load image err: ${url}`);
		image.src = defaultImgData;
		image.crossOrigin='Anonymous';
		let errPm = new Promise((resolve: (rp: {image: HTMLImageElement, url: string}) => any, reject: (jp: {image: HTMLImageElement, url: string}) => any) => {
	//		// image.crossorigin='anonymous';
	//		// image.crossOrigin = "anonymous";
	//		// image.setAttribute('crossOrigin', 'anonymous');
	//		// image.setAttribute('crossorigin', 'anonymous');
			image.onload = () => { resolve({ image: image, url: url }); };
			image.onabort = () => { reject({ image: image, url: url }); };
			image.onerror = () => { reject({ image: image, url: url }); };
		});
		return await errPm.then(rp => rp.image).catch(jp => { return null; }
		);
	});
};

export interface Canvas2dShape extends Shape2D {

	clone(): Canvas2dShape;

	draw(cvsCtx: CanvasRenderingContext2D): Canvas2dShape;

	drawDesign(cvsCtx: CanvasRenderingContext2D): Canvas2dShape;

	drawWantMove(cvsCtx: CanvasRenderingContext2D, start: Point2D, end: Point2D): Canvas2dShape;

	drawWantScale(cvsCtx: CanvasRenderingContext2D, start: Point2D, end: Point2D): Canvas2dShape;

	drawVertexRays(cvsCtx: CanvasRenderingContext2D, location: Point2D): Array<Ray>;

	drawObstacleRays(cvsCtx: CanvasRenderingContext2D, location: Point2D): Array<Ray>;

	// // 画出切线
	// drawTangentLine(cvsCtx: CanvasRenderingContext2D, location: Point2D, rays: Array<Ray>): Array<Ray>;


	// // 画出切线
	// drawTangentLine(painter: Painter, location: Point2D, rays: Array<Ray>) {
	// 	for (let i = 0; i < rays.length; i++) {
	// 		painter.draw(() => {
	// 			painter.fillCircle(rays[i].start, 3, 0, PI_DOUBLE, false, { fillStyle: "#0000FF" });
	// 			painter.strokeLine(location, rays[i].end, { strokeStyle: "#FF0000" });
	// 		});
	// 	}
	// 	return rays;
	// };

}

export class CanvasLine extends Line implements Canvas2dShape {

	constructor(id: string, start: Point2D, end: Point2D, color: string, visiable: boolean, blockView: boolean) {
		super(id, start, end, color, visiable, blockView);
	}

	byModel(line: Line): CanvasLine {
		return new CanvasLine(line.id, line.start, line.end, line.color, line.visiable, line.blockView);
	}

	clone(): CanvasLine {
		return new CanvasLine(this.id, this.start, this.end, this.color, this.visiable, this.blockView);
	}

	draw(cvsCtx: CanvasRenderingContext2D): CanvasLine {
		cvsCtx.save();
		applyStyle(cvsCtx, { lineWidth: 3, strokeStyle: this.color });
		cvsCtx.beginPath();
		cvsCtx.moveTo(this.start.x, this.start.y);
		cvsCtx.lineTo(this.end  .x, this.end  .y);
		cvsCtx.stroke();
		cvsCtx.restore();
		return this;
	}

	drawDesign(cvsCtx: CanvasRenderingContext2D): CanvasLine {
		cvsCtx.save();
		applyStyle(cvsCtx, { lineWidth: 3, strokeStyle: '#0000FF' });
		cvsCtx.beginPath();
		cvsCtx.moveTo(this.start.x, this.start.y);
		cvsCtx.lineTo(this.end  .x, this.end  .y);
		cvsCtx.stroke();
		cvsCtx.restore();
		return this;
	}


	drawWantMove(cvsCtx: CanvasRenderingContext2D, start: Point2D, end: Point2D): CanvasLine {
		let dist = this.moveP2P(start, end);

		cvsCtx.save();

 		// 画起点与终点之间的连线
		applyStyle(cvsCtx, { lineWidth: 3, strokeStyle: 'rgba(255, 0, 0, 0.7)' });
		cvsCtx.beginPath();
		cvsCtx.moveTo(this.center().x, this.center().y);
		cvsCtx.lineTo(dist.center().x, dist.center().y);
		cvsCtx.stroke();
 		// 画移动后的线，外层的粗线
		applyStyle(cvsCtx, { lineWidth: 8, strokeStyle: 'rgba(0, 255, 0, 0.7)' });
		cvsCtx.beginPath();
		cvsCtx.moveTo(dist.start.x, dist.start.y);
		cvsCtx.lineTo(dist.end  .x, dist.end  .y);
		cvsCtx.stroke();
 		// 画移动后的线，内层的细线
		applyStyle(cvsCtx, { lineWidth: 3, strokeStyle: 'rgba(0, 0, 255, 0.7)' });
		cvsCtx.beginPath();
		cvsCtx.moveTo(dist.start.x, dist.start.y);
		cvsCtx.lineTo(dist.end  .x, dist.end  .y);
		cvsCtx.stroke();

		cvsCtx.restore();

		return this.byModel(dist);
	}

	drawWantScale(cvsCtx: CanvasRenderingContext2D, start: Point2D, end: Point2D): CanvasLine {
		let newLine = this.scale(start, end);

		cvsCtx.save();

 		// 画移动后的线，外层的粗线
		applyStyle(cvsCtx, { lineWidth: 8, strokeStyle: 'rgba(0, 255, 0, 0.7)' });
		cvsCtx.beginPath();
		cvsCtx.moveTo(newLine.start.x, newLine.start.y);
		cvsCtx.lineTo(newLine.end  .x, newLine.end  .y);
		cvsCtx.stroke();
 		// this.draw();
 		// 画移动后的线，内层的细线
		applyStyle(cvsCtx, { lineWidth: 3, strokeStyle: 'rgba(0, 0, 255, 0.7)' });
		cvsCtx.beginPath();
		cvsCtx.moveTo(newLine.start.x, newLine.start.y);
		cvsCtx.lineTo(newLine.end  .x, newLine.end  .y);
		cvsCtx.stroke();

		cvsCtx.restore();
		return new CanvasLine(this.id, newLine.start, newLine.end, this.color, this.visiable, this.blockView);
	}

	drawVertexRays(cvsCtx: CanvasRenderingContext2D, location: Point2D): Array<Ray> {
		let rays = this.genVertexRays(location);
		drawLines(cvsCtx, rays);
		return rays
	}

	drawObstacleRays(cvsCtx: CanvasRenderingContext2D, location: Point2D): Array<Ray> {
		let rays = this.filterObstacleRays(location);
		drawLines(cvsCtx, rays);
		return rays
	}

}

export class CanvasRectangle extends Rectangle implements Canvas2dShape {
	constructor(
		id: string, location: Point2D, width: number, height: number, 
		color: string, imgInfo: ImageInfo, visiable: boolean, blockView: boolean
	) {
		super(id, location, width, height, color, imgInfo, visiable, blockView);
	}

	byModel(rectangle: Rectangle): CanvasRectangle {
		return new CanvasRectangle(this.id, this.location, this.width, this.height, 
			this.color, this.imgInfo, this.visiable, this.blockView);
	}

	clone(): CanvasRectangle {
		return new CanvasRectangle(this.id, this.location, this.width, this.height, 
			this.color, this.imgInfo, this.visiable, this.blockView);
	}

	draw(cvsCtx: CanvasRenderingContext2D): CanvasRectangle {
		let x      = this.location.x + 3;
		let y      = this.location.y + 3;

		let width  = this.width  - 6;
		let height = this.height - 6;

		cvsCtx.save();
		applyStyle(cvsCtx, {lineWidth: 0, fillStyle: this.color});
		cvsCtx.fillRect(this.location.x, this.location.y, this.width, this.height);
		cvsCtx.beginPath();
		cvsCtx.moveTo(x        , y         );
		cvsCtx.lineTo(x + width, y         );
		cvsCtx.lineTo(x + width, y + height);
		cvsCtx.lineTo(x        , y + height);
		cvsCtx.lineTo(x        , y         );
		cvsCtx.clip();
		if (this.imgInfo && this.imgInfo.image) {
			cvsCtx.drawImage(this.imgInfo.image, 
				this.imgInfo.location.x, this.imgInfo.location.y,
				this.imgInfo.width, this.imgInfo.height, 
				this.location.x, this.location.y, this.width, this.height);

		}

		cvsCtx.restore();

		return this;
	}

	drawDesign(cvsCtx: CanvasRenderingContext2D): CanvasRectangle {
		return this.draw(cvsCtx);
	}

	drawWantMove(cvsCtx: CanvasRenderingContext2D, start: Point2D, end: Point2D): CanvasRectangle {
		let dist = this.moveP2P(start, end);
		cvsCtx.save();
		// 画起点与终点之间的连线
		applyStyle(cvsCtx, { lineWidth: 3, strokeStyle: 'rgba(255, 0, 0, 0.7)' });
		cvsCtx.beginPath();
		cvsCtx.moveTo(this.center().x, this.center().y);
		cvsCtx.lineTo(dist.center().x, dist.center().y);
		cvsCtx.stroke();
		// 半明透明地标示出移动后的位置
		applyStyle(cvsCtx, { lineWidth: 5, fillStyle: "rgba(0, 0, 255, 0.7)" });
		cvsCtx.fillRect(dist.location.x, dist.location.y, this.width, this.height);
		applyStyle(cvsCtx, { strokeStyle: "rgba(0, 255, 0, 0.7)"});
		cvsCtx.strokeRect(dist.location.x, dist.location.y, this.width, this.height);
		cvsCtx.restore();

		return this.byModel(dist);
	}

	drawWantScale(cvsCtx: CanvasRenderingContext2D, start: Point2D, end: Point2D): CanvasRectangle {
		let dist = this.scale(start, end);
		cvsCtx.save();
		// 半明透明地标示出移动后的位置
		applyStyle(cvsCtx, { lineWidth: 5, fillStyle: "rgba(0, 0, 255, 0.7)" });
		cvsCtx.fillRect(dist.location.x, dist.location.y, this.width, this.height);
		applyStyle(cvsCtx, { strokeStyle: "rgba(0, 255, 0, 0.7)"});
		cvsCtx.strokeRect(dist.location.x, dist.location.y, this.width, this.height);
		cvsCtx.restore();
		return this.byModel(dist);
	}

	drawVertexRays(cvsCtx: CanvasRenderingContext2D, location: Point2D): Array<Ray> {
		let rays = this.genVertexRays(location);
		drawLines(cvsCtx, rays);
		return rays
	}

	drawObstacleRays(cvsCtx: CanvasRenderingContext2D, location: Point2D): Array<Ray> {
		let rays = this.filterObstacleRays(location);
		drawLines(cvsCtx, rays);
		return rays
	}

}

export class CanvasCircle extends Circle implements Canvas2dShape {

	constructor(
		id: string, location: Point2D, radius: number,  
		color: string, imgInfo: ImageInfo, visiable: boolean, blockView: boolean
	) {
		super(id, location, radius, color, imgInfo, visiable, blockView);
	}

	byModel(circle: Circle): CanvasCircle  {
		return new CanvasCircle(this.id, this.location, this.radius, 
			this.color, this.imgInfo, this.visiable, this.blockView);
	}

	clone(): CanvasCircle  {
		return new CanvasCircle(this.id, this.location, this.radius, 
			this.color, this.imgInfo, this.visiable, this.blockView);
	}

	draw(cvsCtx: CanvasRenderingContext2D): CanvasCircle {
		cvsCtx.save();
		applyStyle(cvsCtx, { lineWidth: 0, strokeStyle: this.color });
		cvsCtx.beginPath();
		cvsCtx.arc(this.location.x, this.location.y, this.radius, 0, PI_DOUBLE, true);

		applyStyle(cvsCtx, { lineWidth: 0, fillStyle: this.color });
		cvsCtx.fill();
		cvsCtx.stroke();

		cvsCtx.beginPath();
		cvsCtx.arc(this.location.x, this.location.y, this.radius - 3, 0, PI_DOUBLE, true);
		cvsCtx.stroke();
		cvsCtx.clip();
		if (this.imgInfo && this.imgInfo.image) {
			let dx = this.location.x - this.radius;
			let dy = this.location.y - this.radius;
			let dwidth = this.radius * 2;
			let dheight = dwidth;
			cvsCtx.drawImage(this.imgInfo.image, this.imgInfo.location.x, this.imgInfo.location.y,
				this.imgInfo.width, this.imgInfo.height, dx, dy, dwidth, dheight);
		}

		cvsCtx.restore();
		return this;
	}

	drawDesign(cvsCtx: CanvasRenderingContext2D): CanvasCircle {
		return this.draw(cvsCtx);
	}

	drawWantMove(cvsCtx: CanvasRenderingContext2D, start: Point2D, end: Point2D): CanvasCircle {
		let dist = this.moveP2P(start, end);

		cvsCtx.save();
		// 画起点与终点之间的连线
		applyStyle(cvsCtx, {lineWidth : 3, strokeStyle : 'rgba(255, 0, 0, 0.7)'});
		cvsCtx.beginPath();
		cvsCtx.moveTo(this.location.x, this.location.y);
		cvsCtx.lineTo(dist.location.x, dist.location.y);
		cvsCtx.stroke();
		//
		applyStyle(cvsCtx, {lineWidth : 5});
		cvsCtx.beginPath();
		cvsCtx.arc(dist.location.x, dist.location.y, dist.radius, 0, PI_DOUBLE, true);
		applyStyle(cvsCtx, { fillStyle: "rgba(0, 0, 255, 0.7)" });
		cvsCtx.fill();
		applyStyle(cvsCtx, { strokeStyle: "rgba(0, 255, 0, 0.7)" });
		cvsCtx.stroke();
		cvsCtx.restore();

		return this.byModel(dist);
	}

	drawWantScale(cvsCtx: CanvasRenderingContext2D, start: Point2D, end: Point2D): CanvasCircle {
		let dist = this.scale(start, end);

		cvsCtx.save();
		//
		applyStyle(cvsCtx, {lineWidth : 5});
		cvsCtx.beginPath();
		cvsCtx.arc(dist.location.x, dist.location.y, dist.radius, 0, PI_DOUBLE, true);
		applyStyle(cvsCtx, { fillStyle: "rgba(0, 0, 255, 0.7)" });
		cvsCtx.fill();
		applyStyle(cvsCtx, { strokeStyle: "rgba(0, 255, 0, 0.7)" });
		cvsCtx.stroke();
		cvsCtx.restore();

		return this.byModel(dist);
	}

	drawVertexRays(cvsCtx: CanvasRenderingContext2D, location: Point2D): Array<Ray> {
		let rays = this.genVertexRays(location);
		drawLines(cvsCtx, rays);
		return rays
	}

	drawObstacleRays(cvsCtx: CanvasRenderingContext2D, location: Point2D): Array<Ray> {
		let rays = this.filterObstacleRays(location);
		drawLines(cvsCtx, rays);
		return rays
	}

}
