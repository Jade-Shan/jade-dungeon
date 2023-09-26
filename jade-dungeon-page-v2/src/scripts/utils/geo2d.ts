/* jshint esversion: 8 */

// import { Painter } from '../ui/painter';

export const PI_HALF    : number = Math.PI / 2;
export const PI_ONE_HALF: number = Math.PI + PI_HALF;
export const PI_DOUBLE  : number = Math.PI * 2;

export type Point2D = { x: number, y: number };
export type Ray = { start: Point2D, end: Point2D, angle: number, cAngle: number, range: number };
export type ImageInfo = { key: String, location: Point2D, width: number, height: number, src: string, image?: CanvasImageSource };

let copyImageInfo = (imageInfo: ImageInfo): ImageInfo => {
	return { key   : imageInfo.key, location: {
			x : imageInfo && imageInfo.location && imageInfo.location.x ? imageInfo.location.x : 0, 
			y : imageInfo && imageInfo.location && imageInfo.location.y ? imageInfo.location.y : 0}, 
		width : imageInfo && imageInfo.width  ? imageInfo.width  : 1, 
		height: imageInfo && imageInfo.height ? imageInfo.height : 1, 
		src   : imageInfo && imageInfo.src    ? imageInfo.src    : "", 
		image : imageInfo.image };
};

export let distanceP2P = (x1: number, y1: number, x2: number, y2: number) => {
	let g = x1 - x2;
	let j = y1 - y2;
	return Math.sqrt(g * g + j * j);
};

/* 判断点px,py是在线段ax,ay->bx,by左边还是右边的 */
/* result > 0为左， < 0为右， =0为线上 */
let pointOfLineSide = (
	ax: number, ay: number, bx: number, by: number, x: number, y: number
) => {
	return (ay - by) * x + (bx - ax) * y + ax * ay - bx * ay;
}

/* 判断点x,y是在线段ax,ay->bx,by的垂直交点 */
let pointToLine = (ax: number, ay: number, bx: number, by: number, x: number, y: number) => {
	if (ax == bx && ay == by) { return { x: ax, y: by }; } else 
	if (ax == bx            ) { return { x: ax, y:  y }; } else 
	if (ay == by            ) { return { x:  x, y: ay }; }

	let a = x  - ax;
	let b = y  - ay;
	let c = bx - ax;
	let d = by - ay;

	let dot   = a * c + b * d;
	let lenSq = c * c + d * d;
	let param = dot / lenSq;

	if (param < 0) { return { x: ax, y: ay }; } else 
	if (param > 1) { return { x: bx, y: by }; } 

	return { x: ax + param * c, y: ay + param * d }; 
};

let pointToLineDistence = (
	ax: number, ay: number, bx: number, by: number, x: number, y: number
) => {
	let p = pointToLine(ax, ay, bx, by, x, y);
	return distanceP2P(x, y, p.x, p.y);
};

/* 检查两条线段a-b与c-d是否相交，交点的坐标*/
let segmentsIntr = (a: Point2D, b: Point2D, c: Point2D, d: Point2D) => {
	let isCross = false;
	let x = 0;
	let y = 0;

	// 三角形abc 面积的2倍 
	let area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
	// 三角形abd 面积的2倍 
	let area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);
	// 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理); 
	if (area_abc * area_abd > -1) {
		isCross = false;
	}

	// 三角形cda 面积的2倍 
	let area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
	// 三角形cdb 面积的2倍 
	// 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出. 
	let area_cdb = area_cda + area_abc - area_abd;
	if (area_cda * area_cdb > -1) {
		isCross = false;
	}

	//计算交点坐标 
	isCross = true;
	let t = area_cda / (area_abd - area_abc);
	let dx = Math.round(t * (b.x - a.x));
	let dy = Math.round(t * (b.y - a.y));
	return { isCross: isCross, x: a.x + dx, y: a.y + dy };
};

/* 判断一点在第几象限 */
// 因为绘图默认顺时针方向画，
// 所以为了计算方便坐标轴上的点并入顺时钟方向的象限中
let quadOfPoint = (x: number, y: number) => {
	if (x >  0 && y >  0) { return 0b0001; } else 
	if (x <  0 && y >  0) { return 0b0010; } else 
	if (x <  0 && y <  0) { return 0b0100; } else 
	if (x >  0 && y <  0) { return 0b1000; } else 
	if (x == 0 && y == 0) { return 0b1111; } else 
	if (x >  0 && y == 0) { return 0b1001; } else 
	if (x <  0 && y == 0) { return 0b0110; } else 
	if (x == 0 && y >  0) { return 0b0011; } else 
	if (x == 0 && y <  0) { return 0b1100; }
	return 0b1100;
};

/* 判断线段经过哪几个象限 */
// 方程组：
// y_1 = k * x_1 + b
// y_2 = k * x_2 + b
// 推得：
// let k = (y1 - y2) / (x1 - x2);
// let b = (x1 * y2 - x2 * y1) / (x1 - x2);
let quadOfLine = (x1: number, y1: number, x2: number, y2: number) => {
	let quadP1 = quadOfPoint(x1, y1);
	let quadP2 = quadOfPoint(x2, y2);

	let quad = quadP1 | quadP2;

	if (quadP1 == quadP2) { // 线段两端点在同一象限
		// do nothing
	} else {
		let diffX = x1 == x2 ? 1 : x1 - x2;
		let k = (y1 - y2) / diffX;
		let b = (x1 * y2 - x2 * y1) / diffX;

		if (k > 0 && b > 0) { /* 函数过 1, 2, 3 象限 */ quad = 0b0010 | quad; } else 
		if (k > 0 && b < 0) { /* 函数过 1, 3, 4 象限 */ quad = 0b1000 | quad; } else 
		if (k < 0 && b > 0) { /* 函数过 1, 2, 4 象限 */ quad = 0b0001 | quad; } else 
		if (k < 0 && b < 0) { /* 函数过 2, 3, 4 象限 */ quad = 0b0100 | quad; }
	}

	// console.log(`line: (${x1},${y1})->${x2},${y2}) : 0b${quad.toString(2)}`);
	return quad;
};

let genLocationToVertexRays = (location: Point2D, vertex1: Point2D, vertex2: Point2D): Array<Ray> => {
		// 两个切线与外部点的距离与角度
		let c1 = { x: vertex1.x - location.x, y: vertex1.y - location.y};
		let c2 = { x: vertex2.x - location.x, y: vertex2.y - location.y};
		let range1 = Math.round(Math.sqrt(c1.x * c1.x + c1.y * c1.y));
		let range2 = Math.round(Math.sqrt(c2.x * c2.x + c2.y * c2.y));

		// 以外部观察点为中心，统计图形的每条边经过哪些象限
		let quad = quadOfLine(c1.x, c1.y, c2.x, c2.y);
		// console.log(`shape + 0b${quad.toString(2)}`);

		// 计算切线的起止角度
		let angl1 = Math.atan2(c1.y, c1.x);
		let angl2 = Math.atan2(c2.y, c2.x);
		let cAngl1 = 0;
		if (quad == 0b1001 || quad == 0b1101 || quad == 0b1011) {
			cAngl1 = angl1;
		} else if (angl1 < 0) {
			cAngl1 = PI_DOUBLE + angl1;
		} else {
			cAngl1 = angl1;
		}
		let cAngl2 = 0;
		if (quad == 0b1001 || quad == 0b1101 || quad == 0b1011) {
			cAngl2 = angl2;
		} else if (angl2 < 0) {
			cAngl2 = PI_DOUBLE + angl2;
		} else {
			cAngl2 = angl2;
		}

		return cAngl1 < cAngl2 ? [
			{ start: { x: vertex1.x, y: vertex1.y }, end: { x: 0, y: 0 }, angle: angl1, cAngle: cAngl1, range: range1 },
			{ start: { x: vertex2.x, y: vertex2.y }, end: { x: 0, y: 0 }, angle: angl2, cAngle: cAngl2, range: range2 }] : [
			{ start: { x: vertex2.x, y: vertex2.y }, end: { x: 0, y: 0 }, angle: angl2, cAngle: cAngl2, range: range2 },
			{ start: { x: vertex1.x, y: vertex1.y }, end: { x: 0, y: 0 }, angle: angl1, cAngle: cAngl1, range: range1 }]
};



export interface Shape2D {
	id: string;
	location: Point2D;
	color: string;
	visiable: boolean;
	blockView: boolean;

	center(): Point2D;

	clone(): Shape2D;

	/* 外部点到当前图像内个关键点的最近距离 */
	minDistance(location: Point2D): number;

	/* 计算外部点到每个顶点的射线 */
	genVertexRays(location: Point2D): Ray[];

	move(dx: number, dy: number): Shape2D;

	moveP2P(start: Point2D, end: Point2D): Shape2D;

	scale(start: Point2D, end: Point2D): Shape2D;

	isHit(location: Point2D): boolean;

	filterObstacleRays(point: Point2D, rayRange?: number): Array<Ray>;

	// 计算出外部点到这个图形的线的线段
	genTangentLine(point: Point2D, rayRange: number): Array<Ray>;

};

abstract class Abstract2dShape implements Shape2D {

	id       : string;
	location : Point2D;
	color    : string;
	visiable : boolean;
	blockView: boolean;

	constructor(id: string, location: Point2D, color: string, visiable: boolean, blockView: boolean) {
		this.id        = id;
		this.location  = location;
		this.color     = color;
		this.visiable  = visiable;
		this.blockView = blockView;
	}

	abstract center(): Point2D;
	abstract minDistance(location: Point2D): number;
	abstract genVertexRays(location: Point2D): Ray[];
	abstract isHit(location: Point2D): boolean;
	abstract clone(): Abstract2dShape;
	abstract scale(start: Point2D, end: Point2D): Abstract2dShape;
	abstract move(dx: number, dy: number): Abstract2dShape;
	abstract moveP2P(start: Point2D, end: Point2D): Abstract2dShape;

	/* 计算外部点到障碍物轮廓的两条切线 */
	filterObstacleRays(point: Point2D, rayRange?: number): Array<Ray> {
		rayRange = rayRange ? rayRange : Number.MAX_SAFE_INTEGER;
		let rays: Array<Ray> = this.genVertexRays(point);
		// 找到角度最大的点与最小的点
		let minIdx = 0;
		let maxIdx = 0;
		for (let i = 1; i < rays.length; i++) {
			if (rays[i].cAngle < rays[minIdx].cAngle) { minIdx = i; }
			if (rays[i].cAngle > rays[maxIdx].cAngle) { maxIdx = i; }
		}
		// 从角度最小的顶点顺时针遍历到角度最大的顶点
		// 就是所有面向外部点的顶点
		let results: Array<Ray> = [];
		let loopStart = minIdx > maxIdx ? minIdx     : rays.length + minIdx;
		let loopEnd   = maxIdx >     -1 ? maxIdx - 1 : rays.length - 1;
		for (let i = loopStart; i > loopEnd; i--) {
			let idx = i < rays.length ? i : i - rays.length;
			results.push(rays[idx]);
		}
		return results;
	}

	// 计算出外部点到这个图形的线的线段
	genTangentLine(point: Point2D, rayRange: number): Array<Ray> {
		rayRange = rayRange ? rayRange : Number.MAX_SAFE_INTEGER;
		let rays: Array<Ray> = this.filterObstacleRays(point, rayRange);
		for (let i = 0; i < rays.length; i++) {
			rays[i].end.x = point.x + Math.round(rayRange * Math.cos(rays[i].angle));
			rays[i].end.y = point.y + Math.round(rayRange * Math.sin(rays[i].angle));
		}
		return rays;
	};
}

export class Line extends Abstract2dShape {
	
	start   : Point2D
	end     : Point2D
	vertexes: Array<Point2D>;

	constructor(id: string, start: Point2D, end: Point2D, color: string, visiable: boolean, blockView: boolean) {
		super(id, start, color, visiable, blockView);
		this.start    = start;
		this.end      = end;
		this.vertexes = [start, end];
	}

	clone(): Line {
		return new Line(this.id, this.start, this.end, this.color, this.visiable, this.blockView);
	}

	center(): Point2D {
		return {
			x: Math.abs(this.start.x - this.end.x) / 2 + (this.start.x > this.end.x ? this.end.x : this.start.x),
			y: Math.abs(this.start.y - this.end.y) / 2 + (this.start.y > this.end.y ? this.end.y : this.start.y)
		}
	}

	minDistance(location: Point2D): number {
		let dx1 = this.start.x - location.x;
		let dy1 = this.start.y - location.y;
		let dx2 = this.end  .x - location.x;
		let dy2 = this.end  .y - location.y;
		let range1 = Math.round(Math.sqrt(dx1 * dx1 + dy1 * dy1));
		let range2 = Math.round(Math.sqrt(dx2 * dx2 + dy2 * dy2));
		return range1 < range2 ? range1 : range2;
	}

	/* 外部点到每个端点的射线 */
	genVertexRays(location: Point2D): Ray[] {
		let pos1 = { x: this.start.x, y: this.start.y};
		let pos2 = { x: this.end  .x, y: this.end  .y};
		return genLocationToVertexRays(location, this.start, this.end);
	}

	isHit(point: Point2D): boolean {
		console.log(`${this.id} - ${this.start.x},${this.start.y} - ${this.end.x},${this.end.y} : ${point.x},${point.y}`);

		if (this.start.x < this.end.x && (point.x < (this.start.x - 5) || point.x > (this.end  .x + 5))) { return false; } else 
		if (this.start.x > this.end.x && (point.x < (this.end  .x - 5) || point.x > (this.start.x + 5))) { return false; } else 
		if (this.start.y < this.end.y && (point.y < (this.start.y - 5) || point.y > (this.end  .y + 5))) { return false; } else 
		if (this.start.y > this.end.y && (point.y < (this.end  .y - 5) || point.y > (this.start.y + 5))) { return false; }

		let dist = pointToLineDistence(this.start.x, this.start.y, this.end.x, this.end.y, point.x, point.y);
		console.log(`distence is ${dist}`);
		return dist < 10;
	}

	move(dx: number, dy: number): Line {
 		let p1 = { x: this.start.x + dx, y: this.start.y + dy };
		let p2 = { x: this.end  .x + dx, y: this.end  .y + dy };
		return new Line(this.id, p1, p2, this.color, this.visiable, this.blockView);
	}

	moveP2P(start: Point2D, end: Point2D): Line {
		let dx = start.x - end.x;
		let dy = start.y - end.y;
		return this.move(dx, dy);
	}

	scale(start: Point2D, end: Point2D): Line {
		let d1 = distanceP2P(start.x, start.y, this.start.x, this.start.y);
		let d2 = distanceP2P(start.x, start.y, this.end  .x, this.end  .y);
		// console.log(`${start.x},${start.y} - ${this.start.x},${this.start.y} - ${this.end.x},${this.end.y} - ${d1} <> ${d2}`);
		let newStart = d1 < d2 ? { x: end.x, y: end.y } : { x: this.start.x, y: this.start.y };
		let newEnd   = d1 < d2 ? { x: this.end.x, y: this.end.y } : { x: end.x, y: end.y };
		return new Line(this.id, newStart, newEnd, this.color, this.visiable, this.blockView);
	}
}

export class Rectangle extends Abstract2dShape {
	
	width    : number;
	height   : number;
	imgInfo  : ImageInfo;
	vertexes : Array<Point2D>; // 矩形的四个顶点，分别是左上右上左下右下

	constructor(
		id: string, location: Point2D, width: number, height: number, 
		color: string, imgInfo: ImageInfo, visiable: boolean, blockView: boolean
	) {
		super(id, location, color, visiable, blockView);
		this.width    = width  < 10 ? 10 : width ;
		this.height   = height < 10 ? 10 : height;
		this.imgInfo  = copyImageInfo(imgInfo);
		this.vertexes = [
			location, 
			{ x: location.x + width, y: location.y          },
			{ x: location.x + width, y: location.y + height },
			{ x: location.x        , y: location.y + height }];
	}

	clone(): Rectangle {
		return new Rectangle(this.id, this.location, this.width, this.height,
			this.color, this.imgInfo, this.visiable, this.blockView);
	}

	center(): Point2D {
		return {
			x: this.location.x + this.width  / 2,
			y: this.location.y + this.height / 2 };
	}

	/* 外部点到四个角的距离 */
	minDistance(location: Point2D): number {
		let minIdx = 0;
		let minRange = Number.MAX_SAFE_INTEGER;
		for (let i = 0; i < this.vertexes.length; i++) {
			let dx = this.vertexes[i].x - location.x;
			let dy = this.vertexes[i].y - location.y;
			let range = Math.round(Math.sqrt(dx * dx + dy * dy));
			if (range < minRange) {
				minIdx = i;
				minRange = range;
			}
		}
		return minRange;
	}

	/* 计算顶点到外部点的距离与角度 */
	calVtxDstAngle(location: Point2D, vertex: Point2D, quad: number): Ray {
		let dx = vertex.x - location.x;
		let dy = vertex.y - location.y;
		let range = Math.round(Math.sqrt(dx * dx + dy * dy));
		let angle = Math.atan2(dy, dx);
		let cAngle = 0;
		if (quad == 0b1001 || quad == 0b1101 || quad == 0b1011) {
			cAngle = angle;
		} else if (angle < 0) {
			cAngle = Math.PI * 2 + angle;
		} else {
			cAngle = angle;
		}
		return { start: location, end: vertex, angle: angle, cAngle: cAngle, range: range};
	}

	/* 外部点到每个顶点的射线 */
	genVertexRays(location: Point2D): Ray[] {
		// 以外部观察点为中心，统计图形的每条边经过哪些象限
		let quad = 0b0000;
		quad = quad | quadOfLine(this.vertexes[0].x - location.x, this.vertexes[0].y - location.y, this.vertexes[0].x - location.x, this.vertexes[0].y - location.y);
		quad = quad | quadOfLine(this.vertexes[1].x - location.x, this.vertexes[1].y - location.y, this.vertexes[1].x - location.x, this.vertexes[1].y - location.y);
		quad = quad | quadOfLine(this.vertexes[2].x - location.x, this.vertexes[2].y - location.y, this.vertexes[2].x - location.x, this.vertexes[2].y - location.y);
		// console.log(`shape + 0b${quad.toString(2)}`);
		return [
			this.calVtxDstAngle(this.vertexes[0], location, quad),
			this.calVtxDstAngle(this.vertexes[1], location, quad),
			this.calVtxDstAngle(this.vertexes[2], location, quad),
			this.calVtxDstAngle(this.vertexes[3], location, quad)];
	}

	move(dx: number, dy: number): Rectangle {
		let location = { 
			x: this.location.x + dx, 
			y: this.location.y + dy };

		return new Rectangle(this.id, location, this.width, this.height,
			this.color, this.imgInfo, this.visiable, this.blockView);
	}

	moveP2P(start: Point2D, end: Point2D): Rectangle {
		let dx = end.x - start.x;
		let dy = end.y - start.y;
		return this.move(dx, dy);
	}

	scale(start: Point2D, end: Point2D): Rectangle {
		let width   = this.width  + (end.x - start.x);
		let height  = this.height + (end.y - start.y);
		this.width  = width  > 10 ? width  : 10;
		this.height = height > 10 ? height : 10;
		return new Rectangle(this.id, this.location, width, height,
			this.color, this.imgInfo, this.visiable, this.blockView);
	}

	isHit(location: Point2D): boolean {
		if (location.x <  this.location.x || location.y < this.location.y) {
			return false; 
		} else if (location.x > (this.location.x + this.width )) {
			return false; 
		} else if (location.y > (this.location.y + this.height)) {
			return false; 
		} else {
			return true;
		}
	}

}

export class Circle extends Abstract2dShape {

	radius : number;
	imgInfo: ImageInfo;

	constructor(
		id: string, location: Point2D, radius: number,  
		color: string, imgInfo: ImageInfo, visiable: boolean, blockView: boolean
	) {
		super(id, location, color, visiable, blockView);
		this.radius = radius;
		this.imgInfo  = copyImageInfo(imgInfo);
//		this.image = image;
//		this.image.key = image.key;
//		this.image.sx = image.sx ? image.sx : 0;
//		this.image.sy = image.sy ? image.sy : 0;
//		this.image.width = image.width ? image.width : 2 * radius;
//		this.image.height = image.height ? image.height : 2 * radius;
	}

	clone(): Circle {
		return new Circle(this.id, this.location, this.radius,  
			this.color, this.imgInfo, this.visiable, this.blockView);
	}

	center(): Point2D {
		return this.location;
	}

	minDistance(location: Point2D): number {
		let dx = this.location.x - location.x;
		let dy = this.location.y - location.y;
		let range = Math.round(Math.sqrt(dx * dx + dy * dy));
		return range - this.radius;
	}

	/* 外部点到每个顶点的射线 */
	genVertexRays(location: Point2D): Ray[] {
		// 外部点到圆心的连线的角度
		let dx = this.location.x - location.x;
		let dy = this.location.y - location.y;
		let angle = Math.atan2(dy, dx);
		// 两个切线交点到圆心的角度
		let angle1 = angle - PI_HALF;
		let angle2 = angle + PI_HALF;
		// 两个切线交点的坐标
		let dx1 = Math.round(this.radius * Math.cos(angle1));
		let dy1 = Math.round(this.radius * Math.sin(angle1));
		let dx2 = Math.round(this.radius * Math.cos(angle2));
		let dy2 = Math.round(this.radius * Math.sin(angle2));
		let verTex1 = { x: this.location.x + dx1, y: this.location.y + dy1 };
		let verTex2 = { x: this.location.x + dx2, y: this.location.y + dy2 };
		return genLocationToVertexRays(location, verTex1, verTex2);
	}

	isHit(location: Point2D): boolean {
		let g = location.x - this.location.x;
		let j = location.y - this.location.y;
		let distance = Math.sqrt(g * g + j * j);
		// console.log(`${this.id} - ${this.x},${this.y} - ${distance}`);
		return distance < this.radius;
	}

	move(dx: number, dy: number): Circle {
		return new Circle(this.id, { x: this.location.x + dx, y: this.location.y + dy }, 
			this.radius,  this.color, this.imgInfo, this.visiable, this.blockView);
	}

	moveP2P(start: Point2D, end: Point2D): Circle{
		let dx = end.x - start.x;
		let dy = end.y - start.y;
		return this.move(dx, dy);
	}

	scale(start: Point2D, end: Point2D): Circle {
		let dx1 = end.x - start.x;
		let dy1 = end.y - start.y;
		let dx2 = end.x - this.location.x;
		let dy2 = end.y - this.location.y;

		let r1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
		let r2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

		let newRadius = r2 < this.radius ?  this.radius - r1 : this.radius + r1;
		newRadius = newRadius < 10 ? 10 : newRadius;
		return new Circle(this.id, { x: this.location.x, y: this.location.y }, 
			newRadius,  this.color, this.imgInfo, this.visiable, this.blockView);
	}

}



//class Circle extends Canvas2dShape {
//
//
//
//	/* 外部点到圆心的连线 */
//	drawLineToCentre(rays, angle) {
//		this.cvsCtx.save();
//		// 画出圆心
//		this.cvsCtx.fillStyle = "#0000FF";
//		this.cvsCtx.beginPath();
//		this.cvsCtx.arc(this.x, this.y, 5, PI_DOUBLE, false);
//		this.cvsCtx.fill();
//		// 画出连线与圆周的交点
//		let dx0 = this.radius * Math.cos(angle);
//		let dy0 = this.radius * Math.sin(angle);
//		this.cvsCtx.fillStyle = "#0000FF";
//		this.cvsCtx.beginPath();
//		this.cvsCtx.arc(this.x + dx0, this.y + dy0, 5, PI_DOUBLE, false);
//		this.cvsCtx.fill();
//		// 外部点连线到圆心
//		this.cvsCtx.strokeStyle = "#FF0000";
//		this.cvsCtx.beginPath();
//		this.cvsCtx.moveTo(x, y);
//		this.cvsCtx.lineTo(this.x, this.y);
//		this.cvsCtx.stroke();
//		this.cvsCtx.restore();
//	}
//
//
//
//
//
//}
//
//class Observer {
//
//	constructor(canvasContext, id, x, y, viewRange, body, rayColor, visiable, blockView) {
//		this.id = id;
//		this.x = x;
//		this.y = y;
//		this.rayColor = rayColor;
//		this.rayRange = viewRange + 5;
//		// this.rays      = [];
//
//		this.cvsCtx = canvasContext;
//		this.body = body;
//		// this.body  = new Circle(canvasContext, id, x, y, 25, selfColor, visiable, blockView);	
//	}
//
//	move(dx, dy) {
//		this.x += dx; this.y += dy;
//		this.body.x = this.x; this.body.y = this.y;
//	}
//
//	draw() {
//		this.cvsCtx.save();
//		// this.body.draw();
//		this.cvsCtx.beginPath();
//		this.cvsCtx.moveTo(this.x, this.y);
//
//		this.cvsCtx.stroke();
//		this.cvsCtx.fillStyle = this.rayColor;
//		this.cvsCtx.fill();
//		this.cvsCtx.restore();
//	}
//
//	/* 每个障碍面对观察者的一边的每个关键点 */
//	viewObstatleSides(obstacle) {
//		let rays = obstacle.genVertexRays(this.x, this.y, this.rayRange);
//		rays = obstacle.filterObstacleRays(rays);
//		rays = obstacle.genTangentLine(this.x, this.y, this.rayRange, rays);
//		return rays;
//	}
//
//	/* 画出障碍物的阴影 */
//	drawObstatleShadows(side, shadowImage) {
//		let start = side[0];
//		let end = side[side.length - 1];
//		// 
//		this.cvsCtx.save();
//		this.cvsCtx.beginPath();
//		this.cvsCtx.moveTo(start.endX, start.endY);
//		this.cvsCtx.arc(this.x, this.y, this.rayRange, start.angle, end.angle, false);
//		this.cvsCtx.lineTo(end.startX, end.startY);
//		this.cvsCtx.lineTo(start.startX, start.startY);
//		this.cvsCtx.lineTo(start.endX, start.endY);
//		this.cvsCtx.clip();
//		this.cvsCtx.drawImage(shadowImage, 0, 0);
//		this.cvsCtx.restore();
//	}
//
//	filterTokensInView(tokens) {
//		return tokens.filter((c) => {
//			return c.minDistance(this.x, this.y) < this.rayRange;
//		}).sort((a, b) => { // 按距离从先画远的再画近的对象
//			return b.minDistance(this.x, this.y) - a.minDistance(this.x, this.y);
//		});
//	}
//
//	renderTokensOnSandbox(mapImage, tokens, isObstatle) {
//		for (let p = 0; p < tokens.length; p++) {
//			if (tokens[p].blockView && tokens[p].id != this.id && tokens[p].id != 'spectator') {
//				let side = this.viewObstatleSides(tokens[p]);
//				this.drawObstatleShadows(side, mapImage);
//			}
//			if (tokens[p].visiable) {
//				tokens[p].draw();
//			}
//		}
//	}
//
//	renderTokensOnSandboxInView(mapImage, tokens) {
//		let vTokens = this.filterTokensInView(tokens);
//		this.renderTokensOnSandbox(mapImage, vTokens);
//	}
//
//}
//
//
//