import * as React from "react";
import {Resizable} from "re-resizable"

import { Navbar } from "../ui/navbar";
import { testCanvas } from "../components/testCanvas"

import '../../styles/sandtable.less';

let Sandtable = () => {

	let cvsRef = React.useRef(null);
	let msgWin = React.useRef(null);
	let dicWin = React.useRef(null);

	const [msgWinZIdx, setMsgWinZIdx] = React.useState(100);
	const [dicWinZIdx, setDicWinZIdx] = React.useState(100);


	let topWindow = (winId: String): void => {
		if ("msgWin" == winId) {
			setMsgWinZIdx(111);
			setDicWinZIdx(100);
		} else {
			setMsgWinZIdx(100);
			setDicWinZIdx(111);
		}
	}

	setTimeout(() => {
		let cvs = cvsRef.current;
		let cvsCtx: CanvasRenderingContext2D = cvs.getContext('2d');
		testCanvas(cvsCtx);
	}, 5000);

	return <>
		<Navbar title="Sand Table" />
		<div id="sandtable-body" className="container-fluid">
			<canvas ref={cvsRef} id="tutorial" width="1600" height="800">
				not support canvas
			</canvas>
		</div>
		<div id="message-window" ref={msgWin} className="float-window" 
			style={{zIndex:msgWinZIdx}}
			onClick={e => topWindow("msgWin")}>
			<Resizable defaultSize={{ width: 320, height: 240 }} minHeight={50} minWidth={80}>
				<div className="title-bar">
					<i className="title-icon bi-people-fill" ></i>
					<span className="title-text">Message</span>
				</div>
			</Resizable>
		</div>
		<div id="dice-window" ref={dicWin} className="float-window" 
			style={{zIndex:dicWinZIdx}}
			onClick={e => topWindow("dicWin")}>
			<Resizable defaultSize={{ width: 320, height: 240 }} minHeight={50} minWidth={80}>
				<div className="title-bar" onClick={e => topWindow("dice-window")}>
					<i className="title-icon bi-dice-6" ></i>
					<span className="title-text">Dice Log</span>
				</div>
			</Resizable>
		</div>
	</>;

};

export default Sandtable;