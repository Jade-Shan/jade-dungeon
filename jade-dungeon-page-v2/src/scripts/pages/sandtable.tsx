import * as React from "react";
/*
import { Resizable } from "re-resizable"
import Draggable from 'react-draggable';
*/

import { Navbar } from "../ui/navbar";
/* 
import { initSandtable} from "../components/testCanvas"
*/
import {initSandtable} from "../components/sandtable-view";

import '../../styles/sandtable.less';


/* 防抖函数，防止指间隔内重复触发 */
let debounce = (fn: () => any, intervalMS: number = 300) => {
	// 作为闭包存了上次调的引用
	let timeout: NodeJS.Timeout = null;
	return () => {
		// 如果上次调用还没执行，就清除上次调用
		clearTimeout(timeout);
		// 记录下本次定时任的引用，用于下次调用时取消
		timeout = setTimeout(() => { fn(); }, intervalMS);
	};
}

// let getElementById: (elemId: string) => HTMLElement = (() => {
// 	let map: Map<string, HTMLElement> = new Map();
// 	return (elemId: string): HTMLElement => {
// 		if (map.has(elemId) && null != map.get(elemId)) {
// 			return map.get(elemId);
// 		} else {
// 			let elem = document.getElementById(elemId);
// 			if (null != elem) {
// 				map.set(elemId, elem);
// 			}
// 			return elem;
// 		}
// 	}
// })();

let Sandtable = () => {

	const WIN_ID_MSG = "msg-win";
	const WIN_ID_DIC = "dic-win";

	let getWinTitleId     = (winId: string) => `${winId}-header`    ;
	let getWinBodyId      = (winId: string) => `${winId}-body`      ;
	let getWinScaleBodyId = (winId: string) => `${winId}-scale-body`;
	let getWinTailId      = (winId: string) => `${winId}-tail`      ;

	let cvsRef = React.useRef(null);

	let setWindowScale = (winId: string) => {

		let scaleType = 'none';
		let dragStart = { x: 0, y: 0 };
		let winSizeStart  = { width: 0, height: 0 };

		let win          = document.getElementById(winId);
		let winHeader    = document.getElementById(getWinTitleId    (winId));
		let winBody      = document.getElementById(getWinBodyId     (winId));
		let winScaleBody = document.getElementById(getWinScaleBodyId(winId));
		let winTail      = document.getElementById(getWinTailId     (winId));

		if (win) {
			win.onmouseup    = e => { scaleType = 'none'; }
			win.onmouseleave = e => { scaleType = 'none'; win.style.cursor = 'auto'; }

			win.onmousedown  = e => {
				let hh = winHeader.getBoundingClientRect().y + winHeader.clientHeight + 5;
				let bx = win.getBoundingClientRect().x + win.clientWidth  - e.clientX;
				let by = win.getBoundingClientRect().y + win.clientHeight - e.clientY;
				// console.log(`${bx} - ${by}`);

				if (e.clientY < hh) {
					win.style.cursor = 'move';
					scaleType = 'none';
				} else if (Math.abs(bx) < 9 && Math.abs(by) < 9) {
					scaleType = 'both';
					win.style.cursor = 'se-resize';
				} else if (Math.abs(bx) < 9) {
					scaleType = 'horizontal';
					win.style.cursor = 'e-resize';
				} else if (Math.abs(by) < 9) {
					scaleType = 'vertical';
					win.style.cursor = 's-resize';
				} else {
					win.style.cursor = 'auto';
					scaleType = 'none';
				}

				if ('none' != scaleType) {
					dragStart = { x: e.clientX, y: e.clientY };
					winSizeStart = { width: win.clientWidth, height: win.clientHeight };
				}
			};

			win.onmousemove = (e) => {
				let hh = winHeader.getBoundingClientRect().y + winHeader.clientHeight + 5;
				let bx = win.getBoundingClientRect().x + win.clientWidth  - e.clientX;
				let by = win.getBoundingClientRect().y + win.clientHeight - e.clientY;
				// console.log(`${bx} - ${by}`);

				if (e.clientY < hh) {
					win.style.cursor = 'move';
				} else if (Math.abs(bx) < 9 && Math.abs(by) < 9) {
					win.style.cursor = 'se-resize';
				} else if (Math.abs(bx) < 9) {
					win.style.cursor = 'e-resize';
				} else if (Math.abs(by) < 9) {
					win.style.cursor = 's-resize';
				} else {
					win.style.cursor = 'auto';
				}

				if (scaleType != 'none') {
					let dx = e.clientX - dragStart.x;
					let dy = e.clientY - dragStart.y;
					let width  = winSizeStart.width  + dx + 5;
					let height = winSizeStart.height + dy + 5;
					if (scaleType == 'both' || scaleType == 'horizontal') { 
						win.style.width  = `${width  < 150 ? 150 : width }px`; 
					} 
					if (scaleType == 'both' || scaleType == 'vertical'  ) { 
						win.style.height = `${height < 200 ? 200 : height}px`; 
					}
					let sheight = winBody.clientHeight - winHeader.clientHeight - winTail.clientHeight;
					winScaleBody.style.height = `${sheight}px`;
				} 
			};
		}
	}

	let setWindowDrag = (winId: string) => {

		let isDragingWindow = false;
		let dragMoveStart = { x: 0, y: 0 };
		let winPosStart   = { x: 0, y: 0 };

		let win       = document.getElementById(winId);
		let winHeader = document.getElementById(getWinTitleId(winId));

		let moveWinStart = (event: MouseEvent) => {
			dragMoveStart = { x: event.clientX, y: event.clientY };
			winPosStart = {
				x: win.getBoundingClientRect().left,
				y: win.getBoundingClientRect().top
			};
			isDragingWindow = true;
			// console.log(dragMoveStart);
		};

		let moveWinEnd = (event: MouseEvent) => {
			isDragingWindow = false;
			// console.log(`${event.clientX}, ${event.clientY}`);
		};

		let moveingWin = (event: MouseEvent) => {
			if (isDragingWindow) {
				let dx = event.clientX - dragMoveStart.x;
				let dy = event.clientY - dragMoveStart.y;
				win.style.left = `${winPosStart.x + dx}px`;
				win.style.top  = `${winPosStart.y + dy}px`;
			}
		};

		if (winHeader && win) {
			winHeader.onmousedown  = moveWinStart;
			winHeader.onmouseup    = moveWinEnd  ;
			winHeader.onmouseleave = moveWinEnd  ;
			winHeader.onmousemove  = moveingWin  ;
		}

	};

	let topWindow = (winId: String): void => {
		if (WIN_ID_MSG == winId) {
			document.getElementById(WIN_ID_MSG).style.zIndex = `101`;
			document.getElementById(WIN_ID_DIC).style.zIndex = `100`;
		} else {
			document.getElementById(WIN_ID_MSG).style.zIndex = `100`;
			document.getElementById(WIN_ID_DIC).style.zIndex = `101`;
		} 
	}

	setTimeout(() => {
			let cvs: HTMLCanvasElement = cvsRef.current;
			let cvsCtx: CanvasRenderingContext2D = cvs.getContext('2d');
			initSandtable(document, cvs, cvsCtx);
			setWindowDrag(WIN_ID_MSG);
			setWindowDrag(WIN_ID_DIC);
			setWindowScale(WIN_ID_MSG);
			setWindowScale(WIN_ID_DIC);
	}, 5000);

	return <>
		<Navbar title="Sand Table" />
		<div id="sandtable-body" className="container-fluid">
			<canvas ref={cvsRef} id="tutorial" width="1600" height="800">
				not support canvas
			</canvas>
		</div>
		<div id={WIN_ID_MSG} className="float-window" onClick={e => topWindow(WIN_ID_MSG)}>
				<div id={getWinTitleId(WIN_ID_MSG)} className="title-bar">
					<i className="title-icon bi-people-fill" ></i>
					<span className="title-text">Message</span>
				</div>
				<div id={getWinBodyId(WIN_ID_MSG)} className="window-body containe-fluid">
					<div id={getWinScaleBodyId(WIN_ID_MSG)} className="log-text col-12">
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
						<p>aaaa aaaa aaaa aaaa aaaa.</p>
					</div>
					<div id={getWinTailId(WIN_ID_MSG)} className="col-12">
						<input type="text" id="ipt-msg" className="form-control" placeholder="按回车提交"></input>
					</div>
				</div>
		</div>
		<div id={WIN_ID_DIC} className="float-window" onClick={e => topWindow(WIN_ID_DIC)}>
				<div id={getWinTitleId(WIN_ID_DIC)} className="title-bar">
					<i className="title-icon bi-dice-6" ></i>
					<span className="title-text">Dice Log</span>
				</div>
				<div id={getWinBodyId(WIN_ID_DIC)} className="window-body containe-fluid">
					<div id={getWinScaleBodyId(WIN_ID_DIC)} className="log-text col-12">
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
						aaaa aaaa aaaa aaaa aaaa.<br/>
					</div>
					<div id={getWinTailId(WIN_ID_DIC)} className="col-12">
						<input type="text" id="ipt-roll" className="form-control" placeholder="example: 2d6+1d4+3"></input>
					</div>
				</div>
		</div>
	</>;

};

export default Sandtable;
