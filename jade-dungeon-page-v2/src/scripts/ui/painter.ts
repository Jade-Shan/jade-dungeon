
import { ImageInfo, Point2D } from "../utils/Geo2d";

export interface Painter {

	applyStyle(style?: DrawStyle): void;

	draw(fn: () => void): void;

	fillCircle(center: Point2D, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean, style?: DrawStyle): void;

	strokeCircle(center: Point2D, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean, style?: DrawStyle): void;

	strokeLine(start: Point2D, end: Point2D, style?: DrawStyle): void;

	fillRect  (location: Point2D, width: number, height: number, style?: DrawStyle): void;

	strokeRect(location: Point2D, width: number, height: number, style?: DrawStyle): void

	clipPoints(locations: Array<Point2D>, style?: DrawStyle): void;

	drawImage(imgInfo: ImageInfo, location: Point2D, width: number, height: number): void;
};

export type DrawStyle = {lineWidth?: number, strokeStyle?: string, fillStyle?: string};

export class CanvasPainter implements Painter {
	cvsCtx: CanvasRenderingContext2D;

	constructor(cvsCtx: CanvasRenderingContext2D){
		this.cvsCtx = cvsCtx;
	}

	applyStyle(style?: DrawStyle) {
		if (style) {
			if (style.fillStyle) {
				this.cvsCtx.fillStyle = style.fillStyle;
			}
			if (style.strokeStyle) {
				this.cvsCtx.strokeStyle = style.strokeStyle;
			}
			if (style.lineWidth) {
				this.cvsCtx.lineWidth = style.lineWidth;
			}
		}
	}

	draw(fn: () => void) {
		this.cvsCtx.save();
		fn();
		this.cvsCtx.restore();
	}

	fillCircle(center: Point2D, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean, style?: DrawStyle) {
		this.applyStyle(style);
		this.cvsCtx.beginPath();
		this.cvsCtx.arc(center.x, center.y, radius, startAngle, endAngle, counterclockwise);
		this.cvsCtx.fill();
	}

	strokeCircle(center: Point2D, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean, style?: DrawStyle) {
		this.applyStyle(style);
		this.cvsCtx.beginPath();
		this.cvsCtx.arc(center.x, center.y, radius, startAngle, endAngle, counterclockwise);
		this.cvsCtx.stroke();
	}

	clipCircle(center: Point2D, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean, style?: DrawStyle) {
		this.applyStyle(style);
		this.cvsCtx.beginPath();
		this.cvsCtx.arc(center.x, center.y, radius, startAngle, endAngle, counterclockwise);
		this.cvsCtx.clip();
	}

	strokeLine(start: Point2D, end: Point2D, style?: DrawStyle) {
		this.applyStyle(style);
		this.cvsCtx.beginPath();
		this.cvsCtx.moveTo(start.x, start.y);
		this.cvsCtx.lineTo(end.x, end.y);
		this.cvsCtx.stroke();
	}

	fillRect(location: Point2D, width: number, height: number, style?: DrawStyle) {
		this.applyStyle(style);
		this.cvsCtx.fillRect(location.x, location.y, width, height);
	}

	strokeRect(location: Point2D, width: number, height: number, style?: DrawStyle) {
		this.applyStyle(style);
		this.cvsCtx.strokeRect(location.x, location.y, width, height);
	}

	clipPoints(locations: Array<Point2D>, style?: DrawStyle) {
		this.applyStyle(style);
		if(locations && locations.length > 1) {
			this.cvsCtx.beginPath();
			this.cvsCtx.moveTo(locations[0].x, locations[0].y);
			for (let i = 1; i < locations.length; i++) {
				this.cvsCtx.lineTo(locations[i].x, locations[i].y);
			}
		}
		this.cvsCtx.clip();
	}

	drawImage(imgInfo: ImageInfo, location: Point2D, width: number, height: number) {
		if (imgInfo && imgInfo.image) {
			// this.cvsCtx.drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
			this.cvsCtx.drawImage(imgInfo.image, imgInfo.location.x, imgInfo.location.y, 
				imgInfo.width, imgInfo.height, location.x, location.y, width, height);
		}
	}

}
