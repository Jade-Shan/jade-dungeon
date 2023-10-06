/* jshint esversion: 8 */
const PI_HALF     = Math.PI / 2;
const PI_ONE_HALF = Math.PI + PI_HALF;
const PI_DOUBLE   = Math.PI * 2;

function distanceP2P(x1, y1, x2, y2) {
	let g = x1 - x2;
	let j = y1 - y2;
	return Math.sqrt(g*g + j*j);
}

/* 判断点px,py是在线段ax,ay->bx,by左边还是右边的 */
/* result > 0为左， < 0为右， =0为线上 */
function pointOfLineSide(ax, ay, bx, by, x, y) {
	return (ay - by) * x + (bx - ax) * y + ax * ay - bx * ay;
}

/* 判断点x,y是在线段ax,ay->bx,by的垂直交点 */
function pointToLine(ax, ay, bx, by, x, y) {
	if (ax == bx && ay == by) {
		return {x: ax, y: by};
	} else if (ax == bx) {
		return {x: ax, y: y};
	} else if (ay == by) {
		return {x: x, y: ay};
	} else {
		let a = x  - ax;
		let b = y  - ay;
		let c = bx - ax;
		let d = by - ay;
		
		let dot   = a * c + b * d;
		let lenSq = c * c + d * d;
		let param = dot / lenSq;

		if (param < 0) {
			return {x: ax, y: ay};
		} else if (param > 1) {
			return {x: bx, y: by};
		} else {
			return {x: ax + param * c, y: ay + param * d};
		}
	}
}

function pointToLineDistence(ax, ay, bx, by, x, y) {
	let p = pointToLine(ax, ay, bx, by, x, y);
	return distanceP2P(x, y, p.x, p.y);
}

/* 检查两条线段a-b与c-d是否相交，交点的坐标*/
function segmentsIntr(a, b, c, d) { 
	let isCross = false;
	let x       = 0;
	let y       = 0;

	// 三角形abc 面积的2倍 
	let area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x); 
	// 三角形abd 面积的2倍 
	let area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x); 
	// 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理); 
	if (area_abc * area_abd > -1) { 
		isCross =  false; 
	} 

	// 三角形cda 面积的2倍 
	let area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x); 
	// 三角形cdb 面积的2倍 
	// 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出. 
	let area_cdb = area_cda + area_abc - area_abd ; 
	if (area_cda * area_cdb > -1) { 
		isCross =  false; 
	} 

	//计算交点坐标 
	isCross = true;
	let t = area_cda / ( area_abd - area_abc ); 
	let dx = Math.round(t * (b.x - a.x));
	let dy = Math.round(t * (b.y - a.y)); 
	return {isCross: isCross, x: a.x + dx , y: a.y + dy }; 
}

/* 判断一点在第几象限 */
// 因为绘图默认顺时针方向画，
// 所以为了计算方便坐标轴上的点并入顺时钟方向的象限中
function quadOfPoint(x, y) {
	if ((x > 0 && y > 0)) {
		return 0b0001; 
	} else if ((x < 0 && y > 0)) {
		return 0b0010; 
	} else if ((x < 0 && y < 0)) {
		return 0b0100; 
	} else if ((x > 0 && y < 0)) {
		return 0b1000; 
	} else if (x == 0 && y == 0) {
		return 0b1111; 
	} else if (x > 0 && y == 0) {
		return 0b1001; 
	} else if (x < 0 && y == 0) {
		return 0b0110; 
	} else if (x == 0 && y > 0) {
		return 0b0011; 
	} else if (x == 0 && y < 0) {
		return 0b1100; 
	}
}

/* 判断线段经过哪几个象限 */
// 方程组：
// y_1 = k * x_1 + b
// y_2 = k * x_2 + b
// 推得：
// let k = (y1 - y2) / (x1 - x2);
// let b = (x1 * y2 - x2 * y1) / (x1 - x2);
function quadOfLine(x1, y1, x2, y2) {
	let quadP1 = quadOfPoint(x1, y1);
	let quadP2 = quadOfPoint(x2, y2);

	let quad = quadP1 | quadP2;

	if (quadP1 == quadP2) { // 线段两端点在同一象限
		// do nothing
	} else {
		let diffX = x1 == x2 ? 1 : x1 - x2;
		let k     = (y1 - y2) / diffX;
		let b     = (x1 * y2 - x2 * y1) / diffX;

		if (k > 0 && b > 0) { // 函数过 1, 2, 3 象限
			quad = 0b0010 | quad;
		} else if (k > 0 && b < 0) { // 函数过 1, 3, 4 象限
			quad = 0b1000 | quad;
		} else if (k < 0 && b > 0) { // 函数过 1, 2, 4 象限
			quad = 0b0001 | quad;
		} else if (k < 0 && b < 0) { // 函数过 2, 3, 4 象限
			quad = 0b0100 | quad;
		}
	}

	// console.log(`line: (${x1},${y1})->${x2},${y2}) : 0b${quad.toString(2)}`);
	return quad;
}

function drawLine(cvsCtx, color, width, x1, y1, x2, y2) {
		cvsCtx.save();
		cvsCtx.strokeStyle = color;
		cvsCtx.lineWidth = width;
		cvsCtx.beginPath();
		cvsCtx.moveTo(x1, y1);
		cvsCtx.lineTo(x2, y2);
		cvsCtx.stroke();
}

function drawLines(cvsCtx, color, width, lines) {
	if (lines && lines.length > 0) {
		for (let i=0; i< lines.length; i++) {
			let l = lines[i];
			drawLine(cvsCtx, color, width, l.startX, l.startY, l.endX, l.endY);
		}
	}
}


class Ray {

	constructor(startX, startY, endX, endY, angle, cAngle, range) {
		this.startX = startX;
		this.startY = startY;
		this.angle  = angle;
		this.cAngle = cAngle;
		this.range  = range;
		this.endX   = endX;
		this.endY   = endY;
	}

}


class Canvas2dShape {

	constructor(canvasContext, id, x, y, color, visiable, blockView) {
		this.classType = 'canvas.shape.2d';
		this.cvsCtx  = canvasContext;
		this.id      = id;
		this.x       = x;
		this.y       = y;
		this.color   = color;
		this.visiable  = visiable ;
		this.blockView = blockView;
	}

	centerX() {return this.x;} 
	centerY() {return this.y;} 

	/* 外部点到当前图像内个关键点的最近距离 */
	minDistance(x, y) { }

	/* 计算外部点到每个顶点的射线 */
	genVertexRays(x, y, rayRange) { }

	/* 计算外部点到障碍物轮廓的两条切线 */
	filterObstacleRays(rays) {
		// 找到角度最大的点与最小的点
		let minIdx = 0;
		let maxIdx = 0;
		for (let i = 1; i < rays.length; i++) {
			if (rays[i].cAngle < rays[minIdx].cAngle) { minIdx = i; }
			if (rays[i].cAngle > rays[maxIdx].cAngle) { maxIdx = i; }
		}

		// 从角度最小的顶点顺时针遍历到角度最大的顶点
		// 就是所有面向外部点的顶点
		let results   = [];
		let loopStart = minIdx > maxIdx ? minIdx     : rays.length + minIdx;
		let loopEnd   = maxIdx > -1     ? maxIdx - 1 : rays.length - 1;
		for (let i = loopStart; i > loopEnd; i--) {
			let idx = i < rays.length ? i : i - rays.length;
			results.push(rays[idx]);
		}
		return results;
	}

	// 计算出外部点到这个图形的线的线段
	genTangentLine(x, y, rayRange, rays) {
		for (let i=0; i < rays.length; i++) {
			rays[i].endX = x + Math.round(rayRange * Math.cos(rays[i].angle));
			rays[i].endY = y + Math.round(rayRange * Math.sin(rays[i].angle));
		}
		return rays;
	}

	// 画出切线
	drawTangentLine(x, y, rays) {
		this.cvsCtx.save();
		for (let i=0; i < rays.length; i++) {
			this.cvsCtx.fillStyle = "#0000FF";
			this.cvsCtx.beginPath();
			this.cvsCtx.arc(rays[i].startX, rays[i].startY, 3, PI_DOUBLE, false);
			this.cvsCtx.fill();
			this.cvsCtx.strokeStyle = "#FF0000";
			this.cvsCtx.beginPath();
			this.cvsCtx.moveTo(x, y);
			this.cvsCtx.lineTo(rays[i].endX, rays[i].endY);
			this.cvsCtx.stroke();
		}
		this.cvsCtx.restore();
		return rays;
	}

	move(dx, dy) {}

	scale(num) {}

	onWantMoveing(dx, dy) {}

	onMoveing(dx, dy) {}

	onScaleing(dx, dy) {}

	isHit(x, y) {}

	draw() { }

	drawDesign () {}

	clone() {}
}

/* 线段 */
class Line extends Canvas2dShape {

	constructor(canvasContext, id, x, y, x2, y2, color, visiable, blockView) {
		super(canvasContext, id, x, y, color, visiable, blockView);
		this.classType = this.classType + '.Line';
		this.x2 = x2;
		this.y2 = y2;
		this.vtx = [[x,y], [x2, y2]];
		this.image = {key: 'unknow', sx: 0, sy: 0, width: 1, height: 1};  
	}

	centerX() {return Math.abs(this.x - this.x2) / 2 + (this.x > this.x2 ? this.x2: this.x);} 
	centerY() {return Math.abs(this.y - this.y2) / 2 + (this.y > this.y2 ? this.y2: this.y);} 

	clone() {
		return new Line(this.cvsCtx, this.id, this.x, this.y, this.x2, this.y2, 
			this.color, this.visiable, this.blockView);
	}

	/* 外部点到当前图像内个关键点的最近距离 */
	minDistance(x, y) { 
		let dx = this.x - x;
		let dy = this.y - y;
		let range = Math.round(Math.sqrt(dx*dx + dy*dy));
		let dx2 = this.x2 - x;
		let dy2 = this.y2 - y;
		let range2 = Math.round(Math.sqrt(dx2*dx2 + dy2*dy2));
		return range < range2 ? range : range2;
	}


	/* 外部点到每个端点的射线 */
	genVertexRays(x, y) {
		let pos1   = [this.x,  this.y];
		let pos2   = [this.x2, this.y2];
		// 两个切线与外部点的距离与角度
		let cx1    = pos1[0] - x;
		let cy1    = pos1[1] - y;
		let cx2    = pos2[0] - x;
		let cy2    = pos2[1] - y;
		let range1 = Math.round(Math.sqrt(cx1*cx1 + cy1*cy1));
		let range2 = Math.round(Math.sqrt(cx2*cx2 + cy2*cy2));

		// 以外部观察点为中心，统计图形的每条边经过哪些象限
		let quad = quadOfLine(cx1, cy1, cx2, cy2);
		// console.log(`shape + 0b${quad.toString(2)}`);
		// 计算切线的起止角度
		let angl1  = Math.atan2(cy1, cx1);
		let angl2  = Math.atan2(cy2, cx2);
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
			new Ray(pos1[0], pos1[1], 0, 0, angl1, cAngl1, range1),	
			new Ray(pos2[0], pos2[1], 0, 0, angl2, cAngl2, range2)] : [
				new Ray(pos2[0], pos2[1], 0, 0, angl2, cAngl2, range2),
				new Ray(pos1[0], pos1[1], 0, 0, angl1, cAngl1, range1)];
	}

	onWantMoveing(cvsCtx, x, y, x1, y1) {
		let dx = x1 - x;
		let dy = y1 - y;
		let p1 = {x: this.x  + dx, y: this.y  + dy};
		let p2 = {x: this.x2 + dx, y: this.y2 + dy};

		let centerX = Math.abs(p1.x - p2.x) / 2 + (p1.x > p2.x ? p2.x: p1.x);
		let centerY = Math.abs(p1.y - p2.y) / 2 + (p1.y > p2.y ? p2.y: p1.y);


		// 画起点与终点之间的连线
		cvsCtx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
		cvsCtx.lineWidth = 3;
		cvsCtx.beginPath();
		cvsCtx.moveTo(this.centerX(), this.centerY());
		cvsCtx.lineTo(centerX, centerY);
		cvsCtx.stroke();
		// 画终点
		cvsCtx.save();
		cvsCtx.strokeStyle = 'rgba(0, 0, 255, 0.7)';
		cvsCtx.lineWidth = 8;
		cvsCtx.beginPath();
		cvsCtx.moveTo(p1.x, p1.y);
		cvsCtx.lineTo(p2.x, p2.y);
		cvsCtx.stroke();
		// this.draw();
		cvsCtx.strokeStyle = 'rgba(0, 0, 255, 0.7)';
		cvsCtx.lineWidth = 3;
		cvsCtx.beginPath();
		cvsCtx.moveTo(p1.x, p1.y);
		cvsCtx.lineTo(p2.x, p2.y);
		cvsCtx.stroke();
		// this.draw();
		cvsCtx.restore();
		//
		let dstToken = this.clone();
		dstToken.x  = dx + this.x ;
		dstToken.y  = dy + this.y ;
		dstToken.x2 = dx + this.x2;
		dstToken.y2 = dy + this.y2;
		return dstToken;
	}

	onMoveing(x, y, x1, y1) {
		this.onWantMoveing(this.cvsCtx, x, y, x1, y1);
	}

	onScaleing(x, y, x2, y2) {
		let d1 = parseInt(distanceP2P(x, y, this.x , this.y ));
		let d2 = parseInt(distanceP2P(x, y, this.x2, this.y2));
		this.cvsCtx.save();
		this.cvsCtx.strokeStyle = 'rgba(0, 0, 255, 0.7)';
		this.cvsCtx.lineWidth = 8;
		this.cvsCtx.beginPath();
		if (d1 < d2) {
			this.cvsCtx.moveTo(x2, y2);
			this.cvsCtx.lineTo(this.x2, this.y2);
		} else {
			this.cvsCtx.moveTo(this.x , this.y );
			this.cvsCtx.lineTo(x2, y2);
		}
		this.cvsCtx.stroke();
		this.draw();
		this.cvsCtx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
		this.cvsCtx.lineWidth = 3;
		this.cvsCtx.beginPath();
		if (d1 < d2) {
			this.cvsCtx.moveTo(x2, y2);
			this.cvsCtx.lineTo(this.x2, this.y2);
		} else {
			this.cvsCtx.moveTo(this.x , this.y );
			this.cvsCtx.lineTo(x2, y2);
		}
		this.cvsCtx.stroke();
		this.draw();
		this.cvsCtx.restore();
	}

	move(x, y, x1, y1) {
		let dx = x1 - x;
		let dy = y1 - y;
		this.x  += dx;
		this.y  += dy;
		this.x2 += dx;
		this.y2 += dy;
	}

	scale(x, y, x2, y2) {
		let d1 = parseInt(distanceP2P(x, y, this.x , this.y ));
		let d2 = parseInt(distanceP2P(x, y, this.x2, this.y2));
		console.log(`${x},${y} - ${this.x},${this.y} - ${this.x2},${this.y2} - ${d1} <> ${d2}`);
		if (d1 < d2) {
			this.x = x2; this.y = y2;
		} else {
			this.x2 = x2; this.y2 = y2;
		}
	}

	isHit(x, y) {
		// console.log(`${this.id} - ${this.x},${this.y} - ${this.x2},${this.y2} : ${x},${y}`);
		if (this.x < this.x2 && (x < (this.x - 5) || x > (this.x2 + 5))) {
			return false;
		} else if (this.x > this.x2 && (x < (this.x2 - 5) || x > (this.x  + 5))) { 
			return false;
		} else if (this.y < this.y2 && (y < (this.y  - 5) || y > (this.y2 + 5))) { 
			return false;
		} else if (this.y > this.y2 && (y < (this.y2 - 5) || y > (this.y  + 5))) { 
			return false;
		} else {
			let dist = pointToLineDistence(this.x, this.y, this.x2, this.y2, x, y);
			console.log(`distence is ${dist}`);
			return dist < 10;
		}
	}

	draw() {
		this.cvsCtx.save();
		this.cvsCtx.strokeStyle = "#00FF00";
		this.cvsCtx.lineWidth = 3;
		this.cvsCtx.beginPath();
		this.cvsCtx.moveTo(this.x, this.y);
		this.cvsCtx.lineTo(this.x2, this.y2);
		this.cvsCtx.stroke();
		this.cvsCtx.restore();
	}

	drawDesign() {
		this.cvsCtx.save();
		this.cvsCtx.strokeStyle = "#0000FF";
		this.cvsCtx.lineWidth = 8;
		this.cvsCtx.beginPath();
		this.cvsCtx.moveTo(this.x, this.y);
		this.cvsCtx.lineTo(this.x2, this.y2);
		this.cvsCtx.stroke();
		this.cvsCtx.restore();
		this.draw();
	}

}

class Rectangle extends Canvas2dShape {

	constructor(canvasContext, id, x, y, width, height, color, image, visiable, blockView) {
		super(canvasContext, id, x, y, color, visiable, blockView);
		this.classType = this.classType + '.Rectangle';
		this.height = height > 10 ? height : 10;
		this.width  = width  > 10 ? width  : 10;
		this.color  = color;
		this.image  = image;
		this.image.key    = image.key;
		this.image.sx     = image.sx     ? image.sx    : 0;
		this.image.sy     = image.sy     ? image.sy    : 0;
		this.image.width  = image.width  ? image.width : this.width;
		this.image.height = image.height ? image.height: this.height;
		this.vtx = [[x,y], [x + width,y], [x + width, y + height], [x, y + height]];
	}
	centerX() {return this.x + this.width  / 2;} 
	centerY() {return this.y + this.height / 2;} 


	clone() {
		return new Rectangle(this.cvsCtx, this.id, this.x, this.y, this.width, this.height, 
			this.color, this.image, this.visiable, this.blockView);
	}

	/* 外部点到当前图像内个关键点的最近距离 */
	minDistance(x, y) {
		let minIdx = 0;
		let minRange = Number.MAX_SAFE_INTEGER;
		for (let i=0; i< this.vtx.length; i++) {
			let dx = this.vtx[i][0] - x;
			let dy = this.vtx[i][1] - y;
			let range = Math.round(Math.sqrt(dx*dx + dy*dy));
			if (range < minRange) {
				minIdx   = i;
				minRange = range;
			}
		}
		return minRange;
	}

	drawLineToCentre(x, y, angle) { }

	/* 计算顶点到外部点的距离与角度 */
	calVtxDstAngle(x, y, outX, outY, quad) {
		let dx = x - outX;
		let dy = y - outY;
		let angle = Math.atan2(dy, dx);
		let cAngle = 0;
		if (quad == 0b1001 || quad == 0b1101 || quad == 0b1011) {
			cAngle = angle;
		} else if (angle < 0) {
			cAngle = Math.PI * 2 + angle;
		} else {
			cAngle = angle;
		}
		return new Ray(x, y, 0, 0, angle, cAngle, Math.sqrt(dx*dx + dy*dy));
	}

	/* 外部点到每个顶点的射线 */
	genVertexRays(x, y) {
		// 以外部观察点为中心，统计图形的每条边经过哪些象限
		let quad = 0b0000;
		quad = quad | quadOfLine(this.vtx[0][0] - x, this.vtx[0][1] - y, this.vtx[1][0] - x, this.vtx[1][1] - y);
		quad = quad | quadOfLine(this.vtx[1][0] - x, this.vtx[1][1] - y, this.vtx[2][0] - x, this.vtx[2][1] - y);
		quad = quad | quadOfLine(this.vtx[2][0] - x, this.vtx[2][1] - y, this.vtx[3][0] - x, this.vtx[3][1] - y);
		// console.log(`shape + 0b${quad.toString(2)}`);
		return [
			this.calVtxDstAngle(this.vtx[0][0], this.vtx[0][1], x, y, quad), 
			this.calVtxDstAngle(this.vtx[1][0], this.vtx[1][1], x, y, quad), 
			this.calVtxDstAngle(this.vtx[2][0], this.vtx[2][1], x, y, quad), 
			this.calVtxDstAngle(this.vtx[3][0], this.vtx[3][1], x, y, quad)];
	}

	onWantMoveing(cvsCtx, x, y, x1, y1) {
		let dx = x1 - x;
		let dy = y1 - y;
		cvsCtx.save();
		// 画起点与终点之间的连线
		cvsCtx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
		cvsCtx.lineWidth = 3;
		cvsCtx.beginPath();
		cvsCtx.moveTo(this.centerX(), this.centerY());
		cvsCtx.lineTo(this.x + dx + this.width / 2, this.y + dy + this.height / 2);
		cvsCtx.stroke();
		//
		cvsCtx.lineWidth = 5;
		cvsCtx.fillStyle   = "rgba(0, 0, 255, 0.7)";
		cvsCtx.fillRect(this.x + dx, this.y + dy, this.width, this.height);
		cvsCtx.strokeStyle = "rgba(0, 255, 0, 0.7)";
		cvsCtx.strokeRect(this.x + dx, this.y + dy, this.width, this.height);
		cvsCtx.restore();
		//
		let dstToken = this.clone();
		dstToken.x  = dx + this.x ;
		dstToken.y  = dy + this.y ;
		return dstToken;
	}

	onMoveing(x, y, x1, y1) {
		this.onWantMoveing(this.cvsCtx, x, y, x1, y1);
	}

	onScaleing(x, y, x1, y1) {
		let width = this.width  +(x1 - x);
		let height= this.height +(y1 - y);
		width  = width  > 10 ? width  : 10;
		height = height > 10 ? height : 10;
		this.cvsCtx.save();
		this.cvsCtx.lineWidth = 5;
		this.cvsCtx.fillStyle   = "rgba(0, 0, 255, 0.7)";
		this.cvsCtx.fillRect  (this.x, this.y, width, height);
		this.cvsCtx.strokeStyle = "rgba(0, 255, 0, 0.7)";
		this.cvsCtx.strokeRect(this.x, this.y, width, height);
		this.cvsCtx.restore();
	}

	move(x, y, x1, y1) {
		let dx = x1 - x;
		let dy = y1 - y;
		this.x  += dx;
		this.y  += dy;
	}

	scale(x, y, x1, y1) {
		let width = this.width  +(x1 - x);
		let height= this.height +(y1 - y);
		width  = width  > 10 ? width  : 10;
		height = height > 10 ? height : 10;
		this.width  = width ;
		this.height = height;
	}

	isHit(x, y) {
		if (x < this.x || y < this.y) {
			return false;
		} else if (x > (this.x + this.width)) {
			return false;
		} else if (y > (this.y + this.height)) {
			return false;
		} else {
			return true;
		}
	}

	draw() {
		this.cvsCtx.save();
		this.cvsCtx.lineWidth = 0;
		this.cvsCtx.fillStyle = this.color;
		this.cvsCtx.fillRect(this.x, this.y, this.width, this.height);
		this.cvsCtx.beginPath();
		let x      = this.x + 3;
		let y      = this.y + 3;
		let width  = this.width  - 6;
		let height = this.height - 6;
		this.cvsCtx.moveTo(x, y);
		this.cvsCtx.lineTo(x + width, y);
		this.cvsCtx.lineTo(x + width, y + height);
		this.cvsCtx.lineTo(x, y + height);
		this.cvsCtx.lineTo(x, y);
		this.cvsCtx.clip();
		if (this.image && this.image.img) {
			this.cvsCtx.drawImage(this.image.img, this.image.sx, this.image.sy, 
				this.image.width, this.image.height, 
				this.x, this.y, this.width, this.height);
		}
		this.cvsCtx.restore();
	}

	drawDesign() {
		this.draw();
	}

}

class Circle extends Canvas2dShape {

	constructor(canvasContext, id, x, y, radius, color, image, visiable, blockView) {
		super(canvasContext, id, x, y, color, visiable, blockView);
		this.classType = this.classType + '.Circle';
		this.radius = radius < 10 ? 10 : radius;
		this.image= image;
		this.image.key    = image.key;
		this.image.sx     = image.sx     ? image.sx     : 0;
		this.image.sy     = image.sy     ? image.sy     : 0;
		this.image.width  = image.width  ? image.width  : 2 * radius;
		this.image.height = image.height ? image.height : 2 * radius;
	}


	clone() {
		return new Circle(this.cvsCtx, this.id, this.x, this.y, this.radius,
			this.color, this.image, this.visiable, this.blockView);
	}

	/* 外部点到当前图像内个关键点的最近距离 */
	minDistance(x, y) {
		let dx = this.x - x;
		let dy = this.y - y;
		let range = Math.round(Math.sqrt(dx*dx + dy*dy));
		return range - this.radius;
	}

	/* 外部点到每个顶点的射线 */
	genVertexRays(x, y) {
		// 外部点到圆心的连线的角度
		let dx     = this.x - x;
		let dy     = this.y - y;
		let angle  = Math.atan2(dy, dx);

		// 两个切线交点到圆心的角度
		let angle1 = angle - PI_HALF;
		let angle2 = angle + PI_HALF;
		// 两个切线交点的坐标
		let dx1    = Math.round(this.radius * Math.cos(angle1));
		let dy1    = Math.round(this.radius * Math.sin(angle1));
		let dx2    = Math.round(this.radius * Math.cos(angle2));
		let dy2    = Math.round(this.radius * Math.sin(angle2));
		let pos1   = [this.x + dx1, this.y + dy1];
		let pos2   = [this.x + dx2, this.y + dy2];
		// 两个切线与外部点的距离与角度
		let cx1    = pos1[0] - x;
		let cy1    = pos1[1] - y;
		let cx2    = pos2[0] - x;
		let cy2    = pos2[1] - y;
		let range1 = Math.round(Math.sqrt(cx1*cx1 + cy1*cy1));
		let range2 = Math.round(Math.sqrt(cx2*cx2 + cy2*cy2));


		// 以外部观察点为中心，统计图形的每条边经过哪些象限
		let quad = quadOfLine(cx1, cy1, cx2, cy2);
		// console.log(`shape + 0b${quad.toString(2)}`);
		// 计算切线的起止角度
		let angl1  = Math.atan2(cy1, cx1);
		let angl2  = Math.atan2(cy2, cx2);
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
			new Ray(pos1[0], pos1[1], 0, 0, angl1, cAngl1, range1),	
			new Ray(pos2[0], pos2[1], 0, 0, angl2, cAngl2, range2)] : [
				new Ray(pos2[0], pos2[1], 0, 0, angl2, cAngl2, range2),
				new Ray(pos1[0], pos1[1], 0, 0, angl1, cAngl1, range1)];
	}

	/* 外部点到圆心的连线 */
	drawLineToCentre(rays, angle) {
		this.cvsCtx.save();
		// 画出圆心
		this.cvsCtx.fillStyle = "#0000FF";
		this.cvsCtx.beginPath();
		this.cvsCtx.arc(this.x, this.y, 5, PI_DOUBLE, false);
		this.cvsCtx.fill();
		// 画出连线与圆周的交点
		let dx0    = this.radius * Math.cos(angle);
		let dy0    = this.radius * Math.sin(angle);
		this.cvsCtx.fillStyle = "#0000FF";
		this.cvsCtx.beginPath();
		this.cvsCtx.arc(this.x + dx0, this.y + dy0, 5, PI_DOUBLE, false);
		this.cvsCtx.fill();
		// 外部点连线到圆心
		this.cvsCtx.strokeStyle = "#FF0000";
		this.cvsCtx.beginPath();
		this.cvsCtx.moveTo(x,y);
		this.cvsCtx.lineTo(this.x, this.y);
		this.cvsCtx.stroke();
		this.cvsCtx.restore();
	}

	onWantMoveing(cvsCtx, x, y, x1, y1) {
		let dx = x1 - x;
		let dy = y1 - y;
		cvsCtx.save();
		// 画起点与终点之间的连线
		cvsCtx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
		cvsCtx.lineWidth = 3;
		cvsCtx.beginPath();
		cvsCtx.moveTo(this.x, this.y);
		cvsCtx.lineTo(this.x + dx, this.y + dy);
		cvsCtx.stroke();
		//
		cvsCtx.lineWidth = 5;
		cvsCtx.beginPath();
		cvsCtx.arc(this.x + dx, this.y + dy, this.radius, 0, PI_DOUBLE, true);
		cvsCtx.fillStyle   = "rgba(0, 0, 255, 0.7)";
		cvsCtx.fill();
		cvsCtx.strokeStyle = "rgba(0, 255, 0, 0.7)";
		cvsCtx.stroke();
		cvsCtx.restore();
		//
		let dstToken = this.clone();
		dstToken.x  = dx + this.x ;
		dstToken.y  = dy + this.y ;
		return dstToken;
	}

	onMoveing(x, y, x1, y1) {
		this.onWantMoveing(this.cvsCtx, x, y, x1, y1);
	}

	onScaleing(x, y, x1, y1) {
		let dx = x1 - x;
		let dy = y1 - y;
		let nr = parseInt(Math.sqrt(dx*dx + dy*dy));
		let dx2 = x1 - this.x;
		let dy2 = y1 - this.y;
		let r2 =  parseInt(Math.sqrt(dx2*dx2 + dy2*dy2));
		if (r2 < this.radius) {
			nr = this.radius - nr;
		} else {
			nr = this.radius + nr;
		}
		if (nr < 10) {
			nr = 10;
		}
		this.cvsCtx.save();
		this.cvsCtx.lineWidth = 5;
		this.cvsCtx.beginPath();
		this.cvsCtx.arc(this.x, this.y, nr, 0, PI_DOUBLE, true);
		this.cvsCtx.fillStyle   = "rgba(0, 0, 255, 0.7)";
		this.cvsCtx.fill();
		this.cvsCtx.strokeStyle = "rgba(0, 255, 0, 0.7)";
		this.cvsCtx.stroke();
		this.cvsCtx.restore();
	}

	move(x, y, x1, y1) {
		let dx = x1 - x;
		let dy = y1 - y;
		this.x += dx;
		this.y += dy;
	}

	scale(x, y, x1, y1) {
		let dx = x1 - x;
		let dy = y1 - y;
		let nr = parseInt(Math.sqrt(dx*dx + dy*dy));
		let dx2 = x1 - this.x;
		let dy2 = y1 - this.y;
		let r2 =  parseInt(Math.sqrt(dx2*dx2 + dy2*dy2));
		if (r2 < this.radius) {
			nr = this.radius - nr;
		} else {
			nr = this.radius + nr;
		}
		if (nr < 10) {
			nr = 10;
		}
		this.radius = nr;
	}

	isHit(x, y) {
		let g = x - this.x;
		let j = y - this.y;
		let distance = Math.sqrt(g*g + j*j);
		// console.log(`${this.id} - ${this.x},${this.y} - ${distance}`);
		return distance < this.radius;
	}

	draw() {
		this.cvsCtx.save();
		this.cvsCtx.lineWidth = 0;
		this.cvsCtx.strokeStyle = this.color;
		this.cvsCtx.beginPath();
		this.cvsCtx.arc(this.x, this.y, this.radius, 0, PI_DOUBLE, true);
		this.cvsCtx.fillStyle = this.color;
		this.cvsCtx.fill();
		this.cvsCtx.stroke();

		this.cvsCtx.beginPath();
		this.cvsCtx.arc(this.x, this.y, this.radius - 3, 0, PI_DOUBLE, true);
		this.cvsCtx.stroke();
		this.cvsCtx.clip();
		if (this.image && this.image.img) {
			let dx = this.x - this.radius;
			let dy = this.y - this.radius;
			let dwidth  = this.radius * 2;
			let dheight = dwidth;
			this.cvsCtx.drawImage(this.image.img, this.image.sx, this.image.sy, 
				this.image.width, this.image.height, 
				dx, dy, dwidth, dheight);
		}
		this.cvsCtx.restore();
	}

	drawDesign() {
		this.draw();
	}

}

class Observer {

	constructor(canvasContext, id, x, y, viewRange, body, rayColor, visiable, blockView) {
		this.id = id;
		this.x  = x;
		this.y  = y;
		this.rayColor  = rayColor;
		this.rayRange  = viewRange + 5;
		// this.rays      = [];

		this.cvsCtx = canvasContext;
		this.body   = body;
		// this.body  = new Circle(canvasContext, id, x, y, 25, selfColor, visiable, blockView);	
	}

	move(dx, dy) { 
		this.x += dx; this.y += dy; 
		this.body.x = this.x; this.body.y = this.y; 
	}

	draw() {
		this.cvsCtx.save();
		// this.body.draw();
		this.cvsCtx.beginPath();
		this.cvsCtx.moveTo(this.x, this.y);

		this.cvsCtx.stroke();
		this.cvsCtx.fillStyle = this.rayColor;
		this.cvsCtx.fill();
		this.cvsCtx.restore();
	}

	/* 每个障碍面对观察者的一边的每个关键点 */
	viewObstatleSides(obstacle) {
		let rays = obstacle.genVertexRays(this.x, this.y, this.rayRange);
		rays = obstacle.filterObstacleRays(rays);
		rays = obstacle.genTangentLine(this.x, this.y, this.rayRange, rays);
		// drawLines(this.cvsCtx, 'rgba(0, 0, 255, 0.9)', 3, rays);
		// debugger;
		return rays;
	}

	/* 画出障碍物的阴影 */
	drawObstatleShadows(side, shadowImage) {
		// debugger;
		let start = side[0];
		let end   = side[side.length - 1];
		// 
		this.cvsCtx.save();
		this.cvsCtx.beginPath();
		this.cvsCtx.moveTo(start.endX, start.endY);
		this.cvsCtx.arc(this.x, this.y, this.rayRange, start.angle, end.angle, false);
		this.cvsCtx.lineTo(end.startX, end.startY);
		this.cvsCtx.lineTo(start.startX, start.startY);
		this.cvsCtx.lineTo(start.endX, start.endY);
		this.cvsCtx.clip();
		this.cvsCtx.drawImage(shadowImage, 0, 0);
		this.cvsCtx.restore();
	}

	filterTokensInView(tokens) {
		return tokens.filter((c) => {
			return c.minDistance(this.x, this.y) < this.rayRange;
		}).sort((a, b) => { // 按距离从先画远的再画近的对象
			return b.minDistance(this.x, this.y) - a.minDistance(this.x, this.y);
		});
	}

	renderTokensOnSandbox(mapImage, tokens, isObstatle) {
		for (let p = 0; p < tokens.length; p++) {
			if (tokens[p].blockView && tokens[p].id != this.id && tokens[p].id != 'spectator') {
				let side = this.viewObstatleSides(tokens[p]);
				this.drawObstatleShadows(side, mapImage);
			}
			if (tokens[p].visiable) {
				tokens[p].draw();
			}
		}
	}

	renderTokensOnSandboxInView(mapImage, tokens) {
		let vTokens = this.filterTokensInView(tokens);
		this.renderTokensOnSandbox(mapImage, vTokens);
	}

}


