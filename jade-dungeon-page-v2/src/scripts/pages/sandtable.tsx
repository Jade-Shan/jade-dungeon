import * as React from "react";

import { Navbar } from "../ui/navbar";
import { ImageInfo } from "../utils/geo2d"

import {loadImage, CanvasLine, CanvasRectangle, CanvasCircle} from "../utils/canvasGeo"

let defaultImgData = 'data:image/jpeg;base64,' +
	'/9j/4AAQSkZJRgABAQEASABIAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc' +
	'4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2' +
	'NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAyADIDAREAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAQCAwUB/' +
	'8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB3CoiXnTp0iZJYIEjcLSIuXFIuaJ0gJmeMjY0BEQECRpD' +
	'YHCozRkaLQAAAAA//8QAIBAAAgICAgIDAAAAAAAAAAAAAgMAARESBBATIBQhMP/aAAgBAQABBQKGwAi3AyZmfR1IAkD' +
	'HCZkKjqLvI9MELlQ6BsXxAGVWOrlrzd/J20bAbt6ctRtAuIeF02lrr67YOw+F1ylFUEcfl//EABQRAQAAAAAAAAAAAA' +
	'AAAAAAAFD/2gAIAQMBAT8BR//EABQRAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQIBAT8BR//EACQQAAEDBAEDBQAAAAAAA' +
	'AAAAAEAAhEDEiAiECEwMUFRYYGR/9oACAEBAAY/Als6FqcpqeSpZ4UvdaFNKvchzvwWOxvLoPp8LV4V9RwuHtiAwrVo' +
	'/VFX6x6GFtVMKJ7f/8QAIBABAAICAgIDAQAAAAAAAAAAAQARITEQUSBhMEFxgf/aAAgBAQABPyGC4osc9SptOF85yP8' +
	'ASELu9k31VCyrxGy4jnfIIAfXcAGNQyg+onen6RgCjhULGfDIZt33e4VBGkgsKp8AeFORdwu77HHl1DswgUeCsWO4ur' +
	'8SAGQ+Mf/aAAwDAQACAAMAAAAQkkkgEEEEgAgEEggEAkEEEAAAn//EABQRAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQMBA' +
	'T8QR//EABQRAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQIBAT8QR//EACEQAQACAgICAgMAAAAAAAAAAAEAESFBEDFRYSCh' +
	'gZHR/9oACAEBAAE/EOiWr1a5jXtWKigBL1b3C3SMLcvLT9o/kF1zF1M2HJKCGADILfUUMUZrzwwkAuFtAQABgh1KF27' +
	'PcBERbSP3AAUHFCFoRshUeovIE8dfhE5nBas2LuI2cBxLiWTKBWkBOoiFCP3KJmwGUyDua4I8TSNM9uhtMRg2r2yick' +
	'18N8f/2Q==';

let testCanvans = async (cvsCtx: CanvasRenderingContext2D): Promise<void> =>  {
	//let line01 = new CanvasLine("line-001", { x: 100, y: 200 }, { x: 300, y: 400 },
	//	"#0000FF", true, true);
	//	line01.draw(cvsCtx);
	//	line01.drawWantScale(cvsCtx, { x: 310, y: 410 }, { x: 550, y: 250 });
	// line01.draw(cvsCtx);
	// line01.drawDesign(cvsCtx);
	// line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x: 110, y: 220 });
	// line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x:  90, y: 120 });
	// line01.drawWantMove(cvsCtx, { x: 110, y: 120 }, { x: 110, y:  90 });
	//
	let me:HTMLImageElement = new Image();
	let img = await loadImage(me, defaultImgData);
	let imgInfo: ImageInfo = { key: "img001", location: {x: 0, y: 0}, width: 50, height: 50, src: defaultImgData, image: img};

	let tang01 = new CanvasRectangle("tang-001", { x: 200, y: 200 }, 80, 90,
		"#0000FF", imgInfo, true, true);
	tang01.draw(cvsCtx);
	// tang01.drawDesign(cvsCtx);
	tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x:  30, y: 220 });
	tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x: 330, y: 220 });
	tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x: 210, y: 120 });
	tang01.drawWantMove(cvsCtx, { x: 210, y: 220 }, { x: 210, y: 320 });
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
			<img id="tmpImg"></img>
		</>;

};

export default Sandtable;