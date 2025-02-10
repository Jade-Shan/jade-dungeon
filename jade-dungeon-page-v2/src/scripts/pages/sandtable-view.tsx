import * as React from "react";

import { Navbar } from "../ui/navbar";
/* 
import { initSandtable} from "../components/testCanvas"
*/
import {initSandtable} from "../components/sandtable-view";

import '../../styles/sandtable.less';

import * as FWin from "../ui/floatWin"


export const WIN_ID_MSG = "msg-win";
export const WIN_ID_DIC = "dic-win";

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

	let cvsRef    = React.useRef(null as HTMLCanvasElement);
	let bufferRef = React.useRef(null as HTMLCanvasElement);

	// let setWindowDrag = (winId: string) => { };

	setTimeout(() => {
		let cvs: HTMLCanvasElement = cvsRef.current;
		let buffer: HTMLCanvasElement = bufferRef.current;
		let cvsCtx: CanvasRenderingContext2D = cvs.getContext('2d');
		let bufferCtx: CanvasRenderingContext2D = buffer.getContext('2d');

		let userId = 'jade';
		// userId = cookieOperator('username');
		let campaignId = 'campaign01';
		let placeId = 'place01';
		let scenceId = 'scene01';
		initSandtable(document, cvs, cvsCtx, buffer, bufferCtx, campaignId, placeId, scenceId, userId);
		FWin.initFloatWindows(WIN_ID_MSG, WIN_ID_DIC);
	}, 5000);

	return <>
		<Navbar title="Sand Table" />
		<div id="sandtable-body" className="container-fluid">
			<canvas ref={cvsRef} id="tutorial" width="1600" height="800">
				not support canvas
			</canvas>
		</div>
		<div id="bufferDiv" style={{display:"none"}} >
			<canvas ref={bufferRef} id="buffer" width="1600" height="800">
				not support canvas
			</canvas>
		</div>
		<MessageWindow id={WIN_ID_MSG} title="Message"  icon="bi-chat-left-dots"></MessageWindow>
		<DiceWindow    id={WIN_ID_DIC} title="Dice Log" icon="bi-dice-6"        ></DiceWindow>
	</>;

};

export default SandtableView;
