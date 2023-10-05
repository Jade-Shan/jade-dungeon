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

let getMessageWindow = (() => {
	let win: HTMLElement = null;
	return (): HTMLElement => { 
		if (null == win) {
			win = document.getElementById('message-window');
		}
		return win;
	}
})();
let getDiceWindow    = (() => {
	let win: HTMLElement = null;
	return (): HTMLElement => {
		if (null == win) {
			win = document.getElementById('dice-window');
		}
		return win;
	}
})();


let Sandtable = () => {

	let cvsRef = React.useRef(null);
	let msgWin: React.MutableRefObject<HTMLDivElement> = React.useRef(null);
	let dicWin: React.MutableRefObject<HTMLDivElement> = React.useRef(null);

	const WIN_ID_MSG = "msg-win";
	const WIN_ID_DIC = "dic-win";

	// const [msgWinZIdx, setMsgWinZIdx] = React.useState(100);
	// const [dicWinZIdx, setDicWinZIdx] = React.useState(100);

	// const [msgWinTop , setMsgWinTop ] = React.useState( 60);
	// const [msgWinLeft, setMsgWinLeft] = React.useState( 10);
	// const [dicWinTop , setDicWinTop ] = React.useState( 60);
	// const [dicWinLeft, setDicWinLeft] = React.useState(310);

	// const [msgWinWidth , setMsgWinWidth ] = React.useState(200);
	// const [msgWinHeight, setMsgWinHeight] = React.useState(100);
	// const [dicWinWidth , setDicWinWidth ] = React.useState(200);
	// const [dicWinHeight, setDicWinHeight] = React.useState(100);

	let dragMoveStart = {x: 0, y: 0};
	let winPosStart   = {x: 0, y: 0};
	let isDragingWindow = false;

	let moveWinStart = (winId: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		let win = WIN_ID_MSG == winId ? getMessageWindow() : getDiceWindow();
		dragMoveStart = { x: event.clientX, y: event.clientY };
		winPosStart   = {
			x: win.getBoundingClientRect().left, 
			y: win.getBoundingClientRect().top   };
		isDragingWindow = true;
		console.log(dragMoveStart);
	};

	let moveWinEnd = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		isDragingWindow = false;
		console.log(`${event.clientX}, ${event.clientY}`);
	};

	let moveingWin = (winId: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (isDragingWindow) {
			let dx = event.clientX - dragMoveStart.x;
			let dy = event.clientY - dragMoveStart.y;
			let win = WIN_ID_MSG == winId ? getMessageWindow() : getDiceWindow();
			win.style.left = `${winPosStart.x + dx}px`;
			win.style.top  = `${winPosStart.y + dy}px`;
		}
	};

	let topWindow = (winId: String): void => {
		if (WIN_ID_MSG == winId) {
			getMessageWindow().style.zIndex = `101`;
			getDiceWindow   ().style.zIndex = `100`;
		} else {
			getMessageWindow().style.zIndex = `100`;
			getDiceWindow   ().style.zIndex = `101`;
		} 
	}

	setTimeout(() => {
			let cvs: HTMLCanvasElement = cvsRef.current;
			let cvsCtx: CanvasRenderingContext2D = cvs.getContext('2d');
			initSandtable(cvs, cvsCtx);
	}, 5000);

	return <>
		<Navbar title="Sand Table" />
		<div id="sandtable-body" className="container-fluid">
			<canvas ref={cvsRef} id="tutorial" width="1600" height="800">
				not support canvas
			</canvas>
		</div>
		<div id={WIN_ID_MSG} ref={msgWin} className="float-window" 
			onClick={e => topWindow(WIN_ID_MSG)}>
				<div className="title-bar" onClick={e => topWindow("message-window")}
					onMouseDown ={(e)=> { moveWinStart(WIN_ID_MSG, e); }}
					onMouseUp   ={(e)=> { moveWinEnd  (e); }}
					onMouseLeave={(e)=> { moveWinEnd  (e); }}
					onMouseMove ={(e)=> { moveingWin(WIN_ID_MSG, e); }}
					>
					<i className="title-icon bi-people-fill" ></i>
					<span className="title-text">Message</span>
				</div>
				<div className="window-body containe-fluid">
					<p>This is Window Body. </p>
				</div>
		</div>
		<div id={WIN_ID_DIC} ref={dicWin} className="float-window" 
			onClick={e => topWindow(WIN_ID_DIC)}>
				<div className="title-bar" onClick={e => topWindow("dice-window")}
					onMouseDown ={(e)=> { moveWinStart(WIN_ID_DIC, e); }}
					onMouseUp   ={(e)=> { moveWinEnd  (e); }}
					onMouseLeave={(e)=> { moveWinEnd  (e); }}
					onMouseMove ={(e)=> { moveingWin(WIN_ID_DIC, e); }}
					>
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