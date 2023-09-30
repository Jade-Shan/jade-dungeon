import * as React from "react";
import { Navbar } from "../ui/navbar";
import { testCanvas } from "../components/testCanvas"


import '../../styles/sandtable.less';

let Sandtable = () => {
	let cvsRef = React.useRef(null);

	setTimeout(() => {
		let cvs = cvsRef.current;
		let cvsCtx: CanvasRenderingContext2D = cvs.getContext('2d');
		testCanvas(cvsCtx);
	}, 5000);

	return <>
		<Navbar title="Sand Table" />
		<div id="sandtable-body" className="container-fluid" >
			<canvas ref={cvsRef} id="tutorial" width="1600" height="800">
				not support canvas
			</canvas>
		</div>
		<div className="float-window">
			<div className="title-bar">
				<h3>title-bar</h3>
			</div>
		</div>
	</>;

};

export default Sandtable;