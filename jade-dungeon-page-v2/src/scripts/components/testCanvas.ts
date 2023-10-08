
import { ImageInfo} from "../utils/canvasGeo"
import {loadImage} from '../utils/commonUtils'

import { loadDefaultIcons, loadDefaultMap } from "../utils/defaultImages";

import {Observer, CanvasLine, CanvasRectangle, CanvasCircle } from "../utils/canvasGeo"

export let initSandtable = async (cvs: HTMLCanvasElement, cvsCtx: CanvasRenderingContext2D): Promise<void> => {
	let icons: ImageInfo = await loadDefaultIcons();
	let map  : ImageInfo = await loadDefaultMap();

	cvsCtx.drawImage(map.image, 0, 0);
	cvsCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
	cvsCtx.fillRect(0, 0, cvs.width, cvs.height);
	let darkMap = await loadImage(new Image(), cvs.toDataURL('image/png', 1.0));
	darkMap.crossOrigin = 'Anonymous';
	cvsCtx.clearRect(0, 0, cvs.width, cvs.height);
	cvsCtx.drawImage(map.image, 0, 0);

	let line01 = new CanvasLine("line-001", { x: 100, y: 200 }, { x: 200, y: 300 }, "#0000FF", true, true);
	let tang01 = new CanvasRectangle("tang-001", { x: 600, y: 100 }, 80, 90, "#0000FF", icons, true, true);
	let circ01 = new CanvasCircle("circ-001", { x: 600, y: 500 }, 60, "#0000FF", icons, true, true);

	let obs: Observer = new Observer("obs", 350, 350, 360, circ01);
	obs.renderObstatleToken(cvsCtx, darkMap, line01);
	obs.renderObstatleToken(cvsCtx, darkMap, tang01);
	obs.renderObstatleToken(cvsCtx, darkMap, circ01);

	let brightMap = await loadImage(new Image(), cvs.toDataURL('image/png', 1.0));
	brightMap.crossOrigin = 'Anonymous';

	cvsCtx.drawImage(darkMap, 0, 0);
	cvsCtx.save();
	cvsCtx.beginPath();
	cvsCtx.arc(obs.location.x, obs.location.y, obs.viewRange, 0, Math.PI * 2);
	cvsCtx.clip();
	cvsCtx.drawImage(brightMap, 0, 0);
	cvsCtx.restore();
}


let initSandtable3 = async (cvs: HTMLCanvasElement, cvsCtx: CanvasRenderingContext2D): Promise<void> => {
	let icons: ImageInfo = await loadDefaultIcons();
	let map  : ImageInfo = await loadDefaultMap();

	cvsCtx.drawImage(map.image, 0, 0);
	cvsCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
	cvsCtx.fillRect(0, 0, cvs.width, cvs.height);
	let darkMap = await loadImage(new Image(), cvs.toDataURL('image/png', 1.0));
	darkMap.crossOrigin = 'Anonymous';

	cvsCtx.clearRect(0, 0, cvs.width, cvs.height);

	cvsCtx.drawImage(map.image, 0, 0);

	let line01 = new CanvasLine("line-001", { x: 100, y: 200 }, { x: 200, y: 300 }, "#0000FF", true, true);

	let tang01 = new CanvasRectangle("tang-001", { x: 600, y: 100 }, 80, 90, "#0000FF", icons, true, true);

	let circ = new CanvasCircle("circ-001", { x: 600, y: 500 }, 60, "#0000FF", icons, true, true);

	let obs: Observer = new Observer("obs", 350, 350, 360, circ);
	// obs.drawVertexRays(cvsCtx, line01);
	// obs.drawVertexRays(cvsCtx, tang01);
	// obs.drawVertexRays(cvsCtx, circ);

	// obs.drawObstacleRays(cvsCtx, line01);
	// obs.drawObstacleRays(cvsCtx, tang01);
	// obs.drawObstacleRays(cvsCtx, circ);

	// obs.drawObstacleRaysInRange(cvsCtx, line01);
	// obs.drawObstacleRaysInRange(cvsCtx, tang01);
	// obs.drawObstacleRaysInRange(cvsCtx, circ);

	let rays01 = obs.drawShadowLine(cvsCtx, line01);
	let rays02 = obs.drawShadowLine(cvsCtx, tang01);
	let rays03 = obs.drawShadowLine(cvsCtx, circ);

	// obs.strokeObstatleShadows(cvsCtx, rays01);
	// obs.strokeObstatleShadows(cvsCtx, rays02);
	// obs.strokeObstatleShadows(cvsCtx, rays03);

	obs.drawObstatleShadows(cvsCtx, rays01, darkMap);
	obs.drawObstatleShadows(cvsCtx, rays02, darkMap);
	obs.drawObstatleShadows(cvsCtx, rays03, darkMap);


	line01.draw(cvsCtx);
	tang01.draw(cvsCtx);
	circ.draw(cvsCtx);
}

let initSandtable2 = async (cvs: HTMLCanvasElement, cvsCtx: CanvasRenderingContext2D): Promise<void> => {
	let icons: ImageInfo = await loadDefaultIcons();
	let map  : ImageInfo = await loadDefaultMap();

	cvsCtx.drawImage(map.image, 0, 0);

	// let img: CanvasImageSource = await loadImage(me, "../../../static/images/map.jpeg");
	// let img: CanvasImageSource = await loadImage(me, "http://www.jade-dungeon.net/images/sandtable/map.png");
	// let imgInfo: ImageInfo = { id: "img001", location: {x: 100, y: 150}, width: 50, height: 50, src: icons.src, image: icons};

	let line01 = new CanvasLine("line-001", { x: 100, y: 200 }, { x: 300, y: 400 }, "#0000FF", true, true);
	line01.draw(cvsCtx);
	// line01.drawWantScale(cvsCtx, { x: 310, y: 410 }, { x: 550, y: 250 });
	// line01.draw(cvsCtx);
	// line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x: 110, y: 220 });
	// line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x:  90, y: 120 });
	// line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x: 110, y:  90 });
	// line01.drawVertexRays(cvsCtx, {x:  50, y: 50});
	// line01.drawVertexRays(cvsCtx, {x: 110, y: 250});
	// line01.drawObstacleRays(cvsCtx, { x: 500, y: 380 });

	let tang01 = new CanvasRectangle("tang-001", { x: 600, y: 100 }, 80, 90, "#0000FF", icons, true, true);
	tang01.draw(cvsCtx);
	// tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x:  80, y: 220 });
	// tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x: 330, y: 220 });
	// tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x: 210, y: 120 });
	// tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x: 210, y: 320 });
	// tang01.drawWantScale(cvsCtx, {x: 210, y: 210}, {x: 300, y: 300});
	// tang01.drawVertexRays(cvsCtx, {x: 500, y: 70});
	// tang01.drawObstacleRays(cvsCtx, { x: 500, y: 380 });

	let circ = new CanvasCircle("circ-001", { x: 600, y: 500 }, 60, "#0000FF", icons, true, true);
	circ.draw(cvsCtx);
	// circ.drawWantMove(cvsCtx, { x: 610, y: 520 }, { x: 480, y: 520 });
	// circ.drawWantMove(cvsCtx, { x: 610, y: 520 }, { x: 730, y: 520 });
	// circ.drawWantMove(cvsCtx, { x: 610, y: 520 }, { x: 610, y: 420 });
	// circ.drawWantMove(cvsCtx, { x: 610, y: 520 }, { x: 610, y: 620 });
	// circ.drawWantScale(cvsCtx, { x: 610, y: 520 }, { x: 630, y: 530 });
	// circ.drawVertexRays(cvsCtx, {x: 500, y: 380});
	// circ.drawObstacleRays(cvsCtx, { x: 500, y: 380 });

	// let circ = new CanvasCircle("circ-001", { x: 130, y: 130 }, 100, "#0000FF", imgInfo, true, true);
	// circ.draw(cvsCtx);
	// circ.drawObstacleRays(cvsCtx, {x: 30, y: 30});
}