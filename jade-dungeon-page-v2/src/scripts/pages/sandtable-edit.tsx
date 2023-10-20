import * as React from "react";

import { Navbar } from "../ui/navbar";
/* 
import { initSandtable} from "../components/testCanvas"
import {initSandtable} from "../components/sandtable-view";
*/

import '../../styles/sandtable.less';

import * as FWin from "../ui/floatWin"

export const WIN_ID_DIC      = "dic-win";
export const WIN_ID_TOKEN    = "token-win";
export const WIN_ID_RESOURCE = "resource-win";

class ResourceWindow extends FWin.FloatWindow {

	WindowBody(): React.JSX.Element {
		return <>
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
		</>;
	}

	WindowTail(): React.JSX.Element {
		return <>
		</>;
	}

}

class TokenWindow extends FWin.FloatWindow {

	WindowBody(): React.JSX.Element {
		return <>
		<div style={{width:500}}></div>
		</>;
	}

	WindowTail(): React.JSX.Element {
		return <>
		</>;
	}

}

class DiceWindow extends FWin.FloatWindow {

	WindowBody(): React.JSX.Element {
		return <>
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
			aaaa aaaa aaaa aaaa aaaa.<br />
		</>;
	}

	WindowTail(): React.JSX.Element {
		return <>
		</>;
	}

}

let SandtableEdit = () => {

	let cvsRef = React.useRef(null as HTMLCanvasElement);

	setTimeout(() => {
		let cvs: HTMLCanvasElement = cvsRef.current;

		let userId = 'jade';
		// userId = cookieOperator('username');
		let campaignId = 'campaign01';
		let placeId = 'place01';
		let scenceId = 'scene01';
		// initSandtable(document, cvs, cvsCtx, buffer, bufferCtx, campaignId, placeId, scenceId, userId);
		FWin.initFloatWindows(WIN_ID_DIC, WIN_ID_TOKEN, WIN_ID_RESOURCE);
	}, 5000);

	return <>
		<Navbar title="Dungeon Edit" />
		<div id="sandtable-body" className="container-fluid">
			<canvas ref={cvsRef} id="dungeonCanvas" width="1600" height="800">
				not support canvas
			</canvas>
		</div>
		<DiceWindow     id={WIN_ID_DIC}      title="Dice Log"   icon="bi-dice-6"        ></DiceWindow>
		<TokenWindow    id={WIN_ID_TOKEN}    title="Edit Token" icon="bi-chat-left-dots"></TokenWindow>
		<ResourceWindow id={WIN_ID_RESOURCE} title="Resources"  icon="bi-map"           ></ResourceWindow>
	</>;
}

export default SandtableEdit;