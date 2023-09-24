import * as React from "react";

import { Navbar } from "../ui/navbar";

let Sandtable = () => {
		let cvsRef = React.useRef(null);

		setTimeout(()=>{
						let cvs = cvsRef.current;
						let cvsCtx: CanvasRenderingContext2D = cvs.getContext('2d');
						cvsCtx.save();
						cvsCtx.fillStyle = "#0000FF";
						cvsCtx.beginPath();
						cvsCtx.arc(100, 100, 3, Math.PI * 2, 0, false);
						cvsCtx.fill();
						cvsCtx.strokeStyle = "#FF0000";
						cvsCtx.beginPath();
						cvsCtx.moveTo(125, 135);
						cvsCtx.lineTo(200, 200);
						cvsCtx.stroke();
						cvsCtx.restore();
		}, 20000);
		return <>
			<Navbar title="Sand Table" />
			<div className="container-fluid">
				<canvas ref={cvsRef} id="tutorial" width="300" height="300">
					not support canvas
				</canvas>
			</div>
		</>;

};

export default Sandtable;