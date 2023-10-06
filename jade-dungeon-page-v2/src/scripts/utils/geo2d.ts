/* jshint esversion: 8 */

export const PI_HALF    : number = Math.PI / 2;
export const PI_ONE_HALF: number = Math.PI + PI_HALF;
export const PI_DOUBLE  : number = Math.PI * 2;

export type Point2D = { x: number, y: number };
export type Ray = { start: Point2D, end: Point2D, angle: number, cAngle: number, range: number };

/* 计算两点的距离 */
export let distanceP2P = (start: Point2D, end: Point2D) => {
	let d1 = start.x - end.x;
	let d2 = start.y - end.y;
	return Math.sqrt(d1 * d1 + d2 * d2);
};

/* 判断点px,py是在线段ax,ay->bx,by左边还是右边的 */
/* result > 0为左， < 0为右， =0为线上 */
let pointOfLineSide = (
	ax: number, ay: number, bx: number, by: number, x: number, y: number
) => {
	return (ay - by) * x + (bx - ax) * y + ax * ay - bx * ay;
}

/* 判断点location在线段start->end的垂直交点 */
let pointToLine = (start: Point2D, end: Point2D, location: Point2D) => {
	if (start.x == end.x && start.y == end.y) { return { x:    start.x, y:      end.y }; } else 
	if (start.x == end.x                    ) { return { x:    start.x, y: location.y }; } else 
	if (start.y == end.y                    ) { return { x: location.x, y:    start.y }; }

	let a = location.x  - start.x;
	let b = location.y  - start.y;
	let c = end.x       - start.x;
	let d = end.y       - start.y;

	let dot   = a * c + b * d;
	let lenSq = c * c + d * d;
	let param = dot / lenSq;

	if (param < 0) { return { x: start.x, y: start.y }; } else 
	if (param > 1) { return { x: end  .x, y: end  .y }; } 

	return { x: start.x + param * c, y: start.y + param * d }; 
};

/* 判断点location到线段start->end的距离 */
let pointToLineDistence = (start: Point2D, end: Point2D, location: Point2D) => {
	let p = pointToLine(start, end, location);
	return distanceP2P(location, p);
};

/* 检查两条线段a-b与c-d是否相交，交点的坐标*/
let segmentsIntr = (a: Point2D, b: Point2D, c: Point2D, d: Point2D) => {
	let isCross = true;
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
	if (isCross) {
		let t = area_cda / (area_abd - area_abc);
		let dx = Math.round(t * (b.x - a.x));
		let dy = Math.round(t * (b.y - a.y));
		return { isCross: true, x: a.x + dx, y: a.y + dy };
	} else {
		return { isCross: false, x: a.x, y: a.y };
	}
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


/* 计算顶点到外部点的距离与角度 */
let calVtxDstAngle = (location: Point2D, vertex: Point2D, quad: number): Ray => {
	let dx = vertex.x - location.x;
	let dy = vertex.y - location.y;
	let range = Math.round(Math.sqrt(dx * dx + dy * dy));
	let angle = Math.atan2(dy, dx);
	let cAngle = 0;
	if (quad == 0b1001 || quad == 0b1101 || quad == 0b1011) {
		cAngle = angle;
	} else if (angle < 0) {
		cAngle = PI_DOUBLE + angle;
	} else {
		cAngle = angle;
	}
	return { start: location, end: vertex, angle: angle, cAngle: cAngle, range: range };
};

// 创建某一点到二维几何形状的每个顶点的连线
let calculateVertexRays = (location: Point2D, ...vertexes: Point2D[]): Array<Ray> => {
	let rays: Array<Ray> = [];
	if (vertexes && vertexes.length > 1) {
		let quad = 0b0000;
		for (let i = 0; i < vertexes.length - 1; i++) {
			quad = quad | quadOfLine(
				vertexes[i    ].x - location.x, vertexes[i    ].y - location.y, 
				vertexes[i + 1].x - location.x, vertexes[i + 1].y - location.y);
		}
		for (let i = 0; i < vertexes.length; i++) {
			rays.push(calVtxDstAngle(location, vertexes[i], quad));
		}
	}
	return rays;
};

export interface Shape2D {
	id: string;
	location: Point2D;
	color: string;
	visiable: boolean;
	blockView: boolean;

	center(): Point2D;

	clone(): Shape2D;

	/* 外部点到图像各个顶点距离中最近的距离 */
	minDistance(location: Point2D): number;

	/* 计算外部点到每个顶点的射线 */
	genVertexRays(location: Point2D): Array<Ray>;

	move(dx: number, dy: number): Shape2D;

	moveP2P(start: Point2D, end: Point2D): Shape2D;

	scale(start: Point2D, end: Point2D): Shape2D;

	isHit(location: Point2D): boolean;

	/* 计算外部点到图形这一面的顶点的连线*/
	filterObstacleRays(location: Point2D): Array<Ray>;

	/* 过滤出外部点到图形这一面的在可视距离内顶点的连线*/
	filterObstacleRaysInRange(location: Point2D, range: Number): Array<Ray>;

	// 计算出外部点到这个图形的线的线段
	genShadowLine(point: Point2D, rayRange: number): Array<Ray>;

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
	abstract genVertexRays(location: Point2D): Ray[];
	abstract isHit(location: Point2D): boolean;
	abstract clone(): Abstract2dShape;
	abstract scale(start: Point2D, end: Point2D): Abstract2dShape;
	abstract move(dx: number, dy: number): Abstract2dShape;
	abstract moveP2P(start: Point2D, end: Point2D): Abstract2dShape;

	/* 外部点到四个角的距离 */
	minDistance(location: Point2D): number {
		let minIdx = 0;
		let minRange = Number.MAX_SAFE_INTEGER;
		let rays = this.genVertexRays(location);
		for (let i = 0; i < rays.length; i++) {
			if (rays[i].range < minRange) {
				minIdx = i;
				minRange = rays[i].range;
			}
		}
		return minRange;
	}

	/* 计算外部点到图形这一面的顶点的连线*/
	filterObstacleRays(location: Point2D): Array<Ray> {
		let rays: Array<Ray> = this.genVertexRays(location);
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

	/* 过滤出外部点到图形这一面的在可视距离内顶点的连线*/
	filterObstacleRaysInRange(location: Point2D, range: number): Array<Ray> {
		let rays = this.filterObstacleRays(location);
		return rays.filter(r => distanceP2P(r.start, r.end) < range);
	}

	// 计算出外部点到这个图形的线的线段
	genShadowLine(location: Point2D, rayRange: number): Array<Ray> {
		rayRange = rayRange ? rayRange : Number.MAX_SAFE_INTEGER;
		let result: Array<Ray> = [];
		let rays: Array<Ray> = this.filterObstacleRaysInRange(location, rayRange);
		for (let i = 0; i < rays.length; i++) {
			let start = { x: rays[i].end.x, y: rays[i].end.y };
			let end = {
				x: location.x + Math.round(rayRange * Math.cos(rays[i].angle)),
				y: location.y + Math.round(rayRange * Math.sin(rays[i].angle))
			}
			let r: Ray = { start: start, end: end, angle: rays[i].angle, cAngle: rays[i].cAngle, 
				range: distanceP2P(start, end)
			};
			result.push(r);
		}
		return result;
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
			x:  this.start.x + (this.end.x - this.start.x) / 2,
			y:  this.start.y + (this.end.y - this.start.y) / 2
		}
	}

	/* 外部点到每个端点的射线 */
	genVertexRays(location: Point2D): Ray[] {
		return calculateVertexRays(location, ...this.vertexes);
	}

	isHit(point: Point2D): boolean {
		// console.log(`${this.id} - ${this.start.x},${this.start.y} - ${this.end.x},${this.end.y} : ${point.x},${point.y}`);

		if (this.start.x < this.end.x && (point.x < (this.start.x - 5) || point.x > (this.end  .x + 5))) { return false; } else 
		if (this.start.x > this.end.x && (point.x < (this.end  .x - 5) || point.x > (this.start.x + 5))) { return false; } else 
		if (this.start.y < this.end.y && (point.y < (this.start.y - 5) || point.y > (this.end  .y + 5))) { return false; } else 
		if (this.start.y > this.end.y && (point.y < (this.end  .y - 5) || point.y > (this.start.y + 5))) { return false; }

		let dist = pointToLineDistence(this.start, this.end, point);
		// console.log(`distence is ${dist}`);
		return dist < 10;
	}

	move(dx: number, dy: number): Line {
 		let p1 = { x: this.start.x + dx, y: this.start.y + dy };
		let p2 = { x: this.end  .x + dx, y: this.end  .y + dy };
		return new Line(this.id, p1, p2, this.color, this.visiable, this.blockView);
	}

	moveP2P(start: Point2D, end: Point2D): Line {
		let dx = end.x - start.x;
		let dy = end.y - start.y;
		return this.move(dx, dy);
	}

	scale(start: Point2D, end: Point2D): Line {
		// 鼠标拖动的起点离线段的哪一个端点更近
		let d1 = distanceP2P(start, this.start);
		let d2 = distanceP2P(start, this.end  );
		// console.log(`${start.x},${start.y} - ${this.start.x},${this.start.y} - ${this.end.x},${this.end.y} - ${d1} <> ${d2}`);
		// 离哪个端点更近，就移动哪个端点的位置
		let newStart = d1 < d2 ? { x:      end.x, y:      end.y } : { x: this.start.x, y: this.start.y };
		let newEnd   = d1 < d2 ? { x: this.end.x, y: this.end.y } : { x:        end.x, y:        end.y };
		return new Line(this.id, newStart, newEnd, this.color, this.visiable, this.blockView);
	}
}

export class Rectangle extends Abstract2dShape {
	
	width    : number;
	height   : number;
	vertexes : Array<Point2D>; // 矩形的四个顶点，分别是左上右上左下右下

	constructor(
		id: string, location: Point2D, width: number, height: number, 
		color: string, visiable: boolean, blockView: boolean
	) {
		super(id, location, color, visiable, blockView);
		this.width    = width  < 10 ? 10 : width ;
		this.height   = height < 10 ? 10 : height;
		this.vertexes = [
			location, 
			{ x: location.x + width, y: location.y          },
			{ x: location.x + width, y: location.y + height },
			{ x: location.x        , y: location.y + height }];
	}

	clone(): Rectangle {
		return new Rectangle(this.id, this.location, this.width, this.height,
			this.color, this.visiable, this.blockView);
	}

	center(): Point2D {
		return {
			x: this.location.x + this.width  / 2,
			y: this.location.y + this.height / 2 };
	}

	/* 外部点到每个顶点的射线 */
	genVertexRays(location: Point2D): Ray[] {
		return calculateVertexRays(location, ...this.vertexes);
	}

	move(dx: number, dy: number): Rectangle {
		let location = { 
			x: this.location.x + dx, 
			y: this.location.y + dy };

		return new Rectangle(this.id, location, this.width, this.height,
			this.color, this.visiable, this.blockView);
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
			this.color, this.visiable, this.blockView);
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

	constructor(
		id: string, location: Point2D, radius: number,  
		color: string, visiable: boolean, blockView: boolean
	) {
		super(id, location, color, visiable, blockView);
		this.radius = radius;
	}

	clone(): Circle {
		return new Circle(this.id, this.location, this.radius,  
			this.color, this.visiable, this.blockView);
	}

	center(): Point2D {
		return this.location;
	}

	// 垂直于连线的直线在圆上的交点
	genDasLian(location: Point2D): Array<Point2D> {
		// 外部点到圆心的连线的角度
		let dx = this.location.x - location.x;
		let dy = this.location.y - location.y;
		let angle = Math.atan2(dy, dx);
		// 垂直于连线的过圆心直线的角度
		let angle1 = angle - PI_HALF;
		let angle2 = angle + PI_HALF;
		// 垂直于连线的过圆心直线交于圆
		let dx1 = Math.round(this.radius * Math.cos(angle1));
		let dy1 = Math.round(this.radius * Math.sin(angle1));
		let dx2 = Math.round(this.radius * Math.cos(angle2));
		let dy2 = Math.round(this.radius * Math.sin(angle2));
		return [
			{ x: this.location.x + dx1, y: this.location.y + dy1 },
			{ x: this.location.x + dx2, y: this.location.y + dy2 }];
	}

	genVertex(location: Point2D): Array<Point2D> {
		let p1 = {x: 0, y: 0};
		let p2 = {x: 0, y: 0};

		// 外部点到圆心的距离
		let dx = location.x - this.location.x;
		let dy = location.y - this.location.y;
		let distance = Math.sqrt(dx * dx + dy * dy);

		// 点在圆内无效
		if (distance < this.radius || distance == this.radius) {
			return [p1, p2];
		}

		// 点到切点的距离
		let length = Math.sqrt(distance * distance - this.radius * this.radius);

		let u = {x: 0, y: 0};
		// 点到圆心的单位向量
		u.x = (this.location.x - location.x) / distance;
		u.y = (this.location.y - location.y) / distance;
		// u.x = dx / distance;
		// u.y = dy / distance;
		// 切线与圆心的夹角
		let angle = Math.asin(this.radius / distance);
		// console.log(' Math.cos( angle) ' + Math.cos( angle));
		// console.log(' Math.sin( angle) ' + Math.sin( angle));
		// console.log(' Math.cos(-angle) ' + Math.cos(-angle));
		// console.log(' Math.sin(-angle) ' + Math.sin(-angle));

		// 向两个方向旋转单位向量
		p1.x = u.x * Math.cos( angle) - u.y * Math.sin( angle);
		p1.y = u.x * Math.sin( angle) + u.y * Math.cos( angle);
		p2.x = u.x * Math.cos(-angle) - u.y * Math.sin(-angle);
		p2.y = u.x * Math.sin(-angle) + u.y * Math.cos(-angle);
		// console.log(`p1: (${p1.x.toFixed(6)},${p1.y.toFixed(6)}),   p2: (${p2.x.toFixed(6)},${p2.y.toFixed(6)})`);
		// 得到新坐标
		p1.x = p1.x * length + location.x;
		p1.y = p1.y * length + location.y;
		p2.x = p2.x * length + location.x;
		p2.y = p2.y * length + location.y;
		// console.log(`p1: (${p1.x.toFixed(6)},${p1.y.toFixed(6)}),   p2: (${p2.x.toFixed(6)},${p2.y.toFixed(6)})`);
		return [p1, p2];
	}

	/* 外部点到每个顶点的射线 */
	genVertexRays(location: Point2D): Ray[] {
		let vertexes = this.genVertex(location);
		return calculateVertexRays(location, ...vertexes);
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
			this.radius,  this.color, this.visiable, this.blockView);
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
			newRadius,  this.color, this.visiable, this.blockView);
	}

}

