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

import * as FWin from "../ui/floatWin"


export const WIN_ID_MSG = "msg-win";
export const WIN_ID_DIC = "dic-win";

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

class DiceWindow extends FWin.FloatWindow {

	WindowBody(): React.JSX.Element {
		return <>
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
		</>;
	}

	WindowTail(): React.JSX.Element {
		return <>
			<input type="text" id="ipt-roll" className="form-control" placeholder="example: 2d6+1d4+3"></input>
		</>;
	}

}

class MessageWindow extends FWin.FloatWindow {

	WindowBody(): React.JSX.Element {
		return <>
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
		</>;
	}

	WindowTail(): React.JSX.Element {
		return <>
			<input type="text" id="ipt-msg" className="form-control" placeholder="按回车提交"></input>
		</>;
	}

}



let SandtableView = () => {

	let cvsRef = React.useRef(null);

	// let setWindowDrag = (winId: string) => { };

	setTimeout(() => {
			let cvs: HTMLCanvasElement = cvsRef.current;
			let cvsCtx: CanvasRenderingContext2D = cvs.getContext('2d');
			initSandtable(document, cvs, cvsCtx);
			FWin.initFloatWindows(WIN_ID_MSG, WIN_ID_DIC);
	}, 5000);

	return <>
		<Navbar title="Sand Table" />
		<div id="sandtable-body" className="container-fluid">
			<canvas ref={cvsRef} id="tutorial" width="1600" height="800">
				not support canvas
			</canvas>
		</div>
		<MessageWindow id={WIN_ID_MSG} title="Message"  icon="bi-people-fill"></MessageWindow>
		<DiceWindow    id={WIN_ID_DIC} title="Dice Log" icon="bi-dice-6"     ></DiceWindow>
	</>;

};

export default SandtableView;
