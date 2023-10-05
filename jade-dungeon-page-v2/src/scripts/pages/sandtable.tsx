import * as React from "react";
/*
import { Resizable } from "re-resizable"
import Draggable from 'react-draggable';
*/

import { Navbar } from "../ui/navbar";
import { initSandtable} from "../components/testCanvas"
/* 
import {initSandtable} from "../components/sandtable-view";
*/

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

let getElementById: (elemId: string) => HTMLElement = (() => {
	let map: Map<string, HTMLElement> = new Map();
	return (elemId: string): HTMLElement => {
		if (map.has(elemId) && null != map.get(elemId)) {
			return map.get(elemId);
			// win = document.getElementById('message-window');
		} else {
			let elem = document.getElementById(elemId);
			if (null != elem) {
				map.set(elemId, elem);
			}
			return elem;
		}
	}
})();

let Sandtable = () => {

	const WIN_ID_MSG = "msg-win";
	const WIN_ID_DIC = "dic-win";

	let cvsRef = React.useRef(null);

	let setWindowDrag = (winId: string) => {

		let isDragingWindow = false;
		let dragMoveStart = { x: 0, y: 0 };
		let winPosStart   = { x: 0, y: 0 };

		let win       = getElementById(winId);
		let winHeader = getElementById(`${winId}-header`);

		let moveWinStart = (event: MouseEvent) => {
			dragMoveStart = { x: event.clientX, y: event.clientY };
			winPosStart = {
				x: win.getBoundingClientRect().left,
				y: win.getBoundingClientRect().top
			};
			isDragingWindow = true;
			console.log(dragMoveStart);
		};

		let moveWinEnd = (event: MouseEvent) => {
			isDragingWindow = false;
			console.log(`${event.clientX}, ${event.clientY}`);
		};

		let moveingWin = (event: MouseEvent) => {
			if (isDragingWindow) {
				let dx = event.clientX - dragMoveStart.x;
				let dy = event.clientY - dragMoveStart.y;
				win.style.left = `${winPosStart.x + dx}px`;
				win.style.top = `${winPosStart.y + dy}px`;
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
			getElementById(WIN_ID_MSG).style.zIndex = `101`;
			getElementById(WIN_ID_DIC).style.zIndex = `100`;
		} else {
			getElementById(WIN_ID_MSG).style.zIndex = `100`;
			getElementById(WIN_ID_DIC).style.zIndex = `101`;
		} 
	}

	setTimeout(() => {
			let cvs: HTMLCanvasElement = cvsRef.current;
			let cvsCtx: CanvasRenderingContext2D = cvs.getContext('2d');
			initSandtable(cvs, cvsCtx);
			setWindowDrag(WIN_ID_MSG);
			setWindowDrag(WIN_ID_DIC);
	}, 5000);

	return <>
		<Navbar title="Sand Table" />
		<div id="sandtable-body" className="container-fluid">
			<canvas ref={cvsRef} id="tutorial" width="1600" height="800">
				not support canvas
			</canvas>
		</div>
		<div id={WIN_ID_MSG} className="float-window" onClick={e => topWindow(WIN_ID_MSG)}>
				<div id={`${WIN_ID_MSG}-header`} className="title-bar" onClick={e => topWindow("message-window")} >
					<i className="title-icon bi-people-fill" ></i>
					<span className="title-text">Message</span>
				</div>
				<div className="window-body containe-fluid">
					<p>This is Window Body. </p>
				</div>
		</div>
		<div id={WIN_ID_DIC} className="float-window" onClick={e => topWindow(WIN_ID_DIC)}>
				<div id={`${WIN_ID_DIC}-header`} className="title-bar" onClick={e => topWindow("dice-window")} >
					<i className="title-icon bi-dice-6" ></i>
					<span className="title-text">Dice Log</span>
				</div>
				<div className="window-body containe-fluid">
					<p>This is Window Body. </p>
				</div>
		</div>
	</>;

};

export default Sandtable;