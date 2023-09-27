import * as React from "react";

import { Navbar } from "../ui/navbar";

import {CanvasLine, CanvasRectangle, CanvasCircle} from "../utils/canvasGeo"

let testCanvans = (cvsCtx: CanvasRenderingContext2D): void =>  {
	let line01 = new CanvasLine("line-001", { x: 110, y: 110 }, { x: 170, y: 220 },
		"#0000FF", true, true);
	line01.draw(cvsCtx);
	// line01.drawDesign(cvsCtx);
	line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x: 110, y: 220 });
	line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x:  90, y: 120 });
	line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x: 110, y:  90 });
}

let Sandtable = () => {
		let cvsRef = React.useRef(null);

		setTimeout(()=>{
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
		</>;

};

export default Sandtable;