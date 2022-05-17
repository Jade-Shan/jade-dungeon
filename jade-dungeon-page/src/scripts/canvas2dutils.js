/* jshint esversion: 8 */
const PI_HALF     = Math.PI / 2;
const PI_ONE_HALF = Math.PI + PI_HALF;
const PI_DOUBLE   = Math.PI * 2;

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

	constructor(canvasContext, x, y, color, visiable, blockView) {
		this.cvsCtx = canvasContext;
		this.x      = x;
		this.y      = y;
		this.color  = color;
		this.visiable  = visiable ;
		this.blockView = blockView;
	}

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

	draw() { }

}

/* 线段 */
class Line extends Canvas2dShape {

	constructor(canvasContext, x, y, x2, y2, color, visiable, blockView) {
		super(canvasContext, x, y, color, visiable, blockView);
		this.x2 = x2;
		this.y2 = y2;
		this.vtx = [[x,y], [x2, y2]];
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

	draw() {
		this.cvsCtx.save();
		this.cvsCtx.strokeStyle = "#00FF00";
		this.cvsCtx.beginPath();
		this.cvsCtx.moveTo(this.x, this.y);
		this.cvsCtx.lineTo(this.x, this.y, this.x2, this.y2);
		this.cvsCtx.lineWidth = 3;
		this.cvsCtx.stroke();
		this.cvsCtx.restore();
	}

}

class Rectangle extends Canvas2dShape {

	constructor(canvasContext, x, y, width, height, color, image, visiable, blockView) {
		super(canvasContext, x, y, color, visiable, blockView);
		this.height = height > 10 ? height : 10;
		this.width  = width  > 10 ? width  : 10;
		this.color  = color;
		this.image  = image;
		this.vtx = [[x,y], [x + width,y], [x + width, y + height], [x, y + height]];
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
		this.cvsCtx.drawImage(this.image, this.x, this.y);
		this.cvsCtx.restore();
	}

}

class Circle extends Canvas2dShape {

	constructor(canvasContext, x, y, radius, color, imageURL, visiable, blockView) {
		super(canvasContext, x, y, color, visiable, blockView);
		this.radius = radius < 10 ? 10 : radius;
		this.imageURL = imageURL;
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
		// let img = document.querySelector('#' + this.imageURL);
		// this.cvsCtx.drawImage(img, this.x - this.radius, this.y - this.radius);
		this.cvsCtx.drawImage(this.imageURL, this.x - this.radius, this.y - this.radius);
		this.cvsCtx.restore();
	}
}

class Observer {

	constructor(canvasContext, x, y, viewRange, selfColor, rayColor, imageURL, visiable, blockView) {
		this.x = x;
		this.y = y;
		this.selfColor = selfColor;
		this.rayColor  = rayColor;
		this.rayRange  = viewRange + 5;
		// this.rays      = [];

		this.cvsCtx = canvasContext;
		this.body  = new Circle(canvasContext, x, y, 25, selfColor, imageURL, visiable, blockView);	
	}

	move(rangeX, rangeY) { 
		this.x += rangeX; this.y += rangeY; 
		this.body.x = this.x; this.body.y = this.y; 
	}

	draw() {
		this.cvsCtx.save();
		this.body.draw();
		this.cvsCtx.beginPath();
		this.cvsCtx.moveTo(this.body.x, this.body.y);

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
		return rays;
	}

	/* 画出障碍物的阴影 */
	drawObstatleShadows(side, shadowImage) {
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
			if (tokens[p].blockView) {
				let side = this.viewObstatleSides(tokens[p]);
				this.drawObstatleShadows(side, mapImage);
			}
			if (tokens[p].visiable) {
				tokens[p].draw();
			}
		}
	}

	renderTokensOnSandboxInView(mapImage, tokens) {
		let vTokens = observer.filterTokensInView(tokens);
		this.renderTokensOnSandbox(mapImage, vTokens);
	}

}


