import * as React from "react";

import { Navbar } from "../ui/navbar";
import { ImageInfo } from "../utils/geo2d"

import {defaultImgData , loadImage, CanvasLine, CanvasRectangle, CanvasCircle} from "../utils/canvasGeo"

let testCanvans = async (cvsCtx: CanvasRenderingContext2D): Promise<void> =>  {
	let me: HTMLImageElement = new Image();
	let img = await loadImage(me, defaultImgData);
	let imgInfo: ImageInfo = { key: "img001", location: {x: 0, y: 0}, width: 50, height: 50, src: defaultImgData, image: img};

	let line01 = new CanvasLine("line-001", { x: 100, y: 200 }, { x: 300, y: 400 },
		"#0000FF", true, true);
	line01.draw(cvsCtx);
	// line01.drawWantScale(cvsCtx, { x: 310, y: 410 }, { x: 550, y: 250 });
	// line01.draw(cvsCtx);
	// line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x: 110, y: 220 });
	// line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x:  90, y: 120 });
	// line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x: 110, y:  90 });
	// line01.drawVertexRays(cvsCtx, {x:  50, y: 50});
	// line01.drawVertexRays(cvsCtx, {x: 110, y: 250});
	line01.drawObstacleRays(cvsCtx, {x: 500, y: 380});

	let tang01 = new CanvasRectangle("tang-001", { x: 600, y: 100 }, 80, 90, "#0000FF", imgInfo, true, true);
	tang01.draw(cvsCtx);
	// tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x:  80, y: 220 });
	// tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x: 330, y: 220 });
	// tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x: 210, y: 120 });
	// tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x: 210, y: 320 });
	// tang01.drawWantScale(cvsCtx, {x: 210, y: 210}, {x: 300, y: 300});
	// tang01.drawVertexRays(cvsCtx, {x: 500, y: 70});
	tang01.drawObstacleRays(cvsCtx, {x: 500, y: 380});

	let circ = new CanvasCircle("circ-001", { x: 600, y: 500 }, 60, "#0000FF", imgInfo, true, true);
	circ.draw(cvsCtx);
	// circ.drawWantMove(cvsCtx, { x: 610, y: 520 }, { x: 480, y: 520 });
	// circ.drawWantMove(cvsCtx, { x: 610, y: 520 }, { x: 730, y: 520 });
	// circ.drawWantMove(cvsCtx, { x: 610, y: 520 }, { x: 610, y: 420 });
	// circ.drawWantMove(cvsCtx, { x: 610, y: 520 }, { x: 610, y: 620 });
	// circ.drawWantScale(cvsCtx, { x: 610, y: 520 }, { x: 630, y: 530 });
	// circ.drawVertexRays(cvsCtx, {x: 500, y: 380});
	circ.drawObstacleRays(cvsCtx, {x: 500, y: 380});

	// let circ = new CanvasCircle("circ-001", { x: 130, y: 130 }, 100, "#0000FF", imgInfo, true, true);
	// circ.draw(cvsCtx);
	// circ.drawObstacleRays(cvsCtx, {x: 30, y: 30});
}

let Sandtable = () => {
	let cvsRef = React.useRef(null);

	setTimeout(() => {
		let cvs = cvsRef.current;
		let cvsCtx: CanvasRenderingContext2D = cvs.getContext('2d');
		testCanvans(cvsCtx);
	}, 5000);

	return <>
		<Navbar title="Sand Table" />
		<div className="container-fluid">
			<canvas ref={cvsRef} id="tutorial" width="800" height="600">
				not support canvas
			</canvas>
		</div>
		<img id="tmpImg"></img>
	</>;

};

export default Sandtable;