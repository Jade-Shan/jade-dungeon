
import { Point2D } from "../utils/Geo2d";

export interface Painter {

	applyStyle(style?: DrawStyle): void;

	draw(fn: () => void): void;

	fillCircle(center: Point2D, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean, style?: DrawStyle): void;

	strokeLine(start: Point2D, end: Point2D, style?: DrawStyle): void;
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

	strokeLine(start: Point2D, end: Point2D, style?: DrawStyle) {
		this.applyStyle(style);
		this.cvsCtx.beginPath();
		this.cvsCtx.moveTo(start.x, start.y);
		this.cvsCtx.lineTo(end.x, end.y);
		this.cvsCtx.stroke();
	}

}
