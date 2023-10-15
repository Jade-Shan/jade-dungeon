
import * as React from "react";

export let getWinTitleId = (winId: string) => `${winId}-header`;
export let getWinBodyId = (winId: string) => `${winId}-body`;
export let getWinScaleBodyId = (winId: string) => `${winId}-scale-body`;
export let getWinTailId = (winId: string) => `${winId}-tail`;

export abstract class FloatWindow extends React.Component<{ id: string, title: string, icon: string}, {}> {

	abstract WindowBody(): React.JSX.Element;
	abstract WindowTail(): React.JSX.Element;

	render() {
		return <>
		<div id={this.props.id} className="float-window">
				<div id={getWinTitleId(this.props.id)} className="title-bar">
					<i className={`title-icon ${this.props.icon}`} ></i>
					<span className="title-text">{this.props.title}</span>
				</div>
				<div id={getWinBodyId(this.props.id)} className="window-body containe-fluid">
					<div id={getWinScaleBodyId(this.props.id)} className="log-text col-12">
						<this.WindowBody></this.WindowBody>
					</div>
					<div id={getWinTailId(this.props.id)} className="col-12">
						<this.WindowTail></this.WindowTail>
					</div>
				</div>
		</div>
		</>;
	}

};

/**
 * 添加窗口的鼠标操作拖动、缩放、点击事件
 * @param winId 窗口的ID
 * @param winMap 界面上所有窗口的映射集合
 */
let initFloatWindow = (winMap: Map<string, HTMLElement>, winId: string) => {

	let win = document.getElementById(winId);
	let winHeader = document.getElementById(getWinTitleId(winId));
	let winBody = document.getElementById(getWinBodyId(winId));
	let winScaleBody = document.getElementById(getWinScaleBodyId(winId));
	let winTail = document.getElementById(getWinTailId(winId));

	winMap.set(winId, win);

	/* ===================================== */
	/* =  窗口缩放                         = */
	/* ===================================== */

	let scaleType = 'none';
	let dragStart = { x: 0, y: 0 };
	let winSizeStart = { width: 0, height: 0 };

	if (win) {
		win.onmouseup = e => { scaleType = 'none'; }
		win.onmouseleave = e => { scaleType = 'none'; win.style.cursor = 'auto'; }

		win.onmousedown = e => {
			// 点击窗口到顶层
			for (let e of winMap) {
				console.log(e[0]);
				if (e[0] == winId) {
					e[1].style.zIndex = '201';
				} else {
					e[1].style.zIndex = '200';
				}
			}

			let hh = winHeader.getBoundingClientRect().y + winHeader.clientHeight + 5;
			let bx = win.getBoundingClientRect().x + win.clientWidth - e.clientX;
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
			let bx = win.getBoundingClientRect().x + win.clientWidth - e.clientX;
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
				let width = winSizeStart.width + dx + 5;
				let height = winSizeStart.height + dy + 5;
				if (scaleType == 'both' || scaleType == 'horizontal') {
					win.style.width = `${width < 150 ? 150 : width}px`;
				}
				if (scaleType == 'both' || scaleType == 'vertical') {
					win.style.height = `${height < 200 ? 200 : height}px`;
				}
				let sheight = winBody.clientHeight - winHeader.clientHeight - winTail.clientHeight;
				winScaleBody.style.height = `${sheight}px`;
			}
		};
	}

	/* ===================================== */
	/* =  窗口拖动                         = */
	/* ===================================== */

	// 窗口拖动状态
	let isDragingWindow = false;
	let dragMoveStart = { x: 0, y: 0 };
	let winPosStart = { x: 0, y: 0 };

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
			win.style.top = `${winPosStart.y + dy}px`;
		}
	};

	if (winHeader && win) {
		winHeader.onmousedown = moveWinStart;
		winHeader.onmouseup = moveWinEnd;
		winHeader.onmouseleave = moveWinEnd;
		winHeader.onmousemove = moveingWin;
	}
}

export let initFloatWindows = (...ids: Array<string>) => {
	let winMap = new Map<string, HTMLElement>();
	for (let id of ids) {
		initFloatWindow(winMap, id);
	}
};