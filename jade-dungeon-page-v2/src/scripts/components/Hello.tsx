import * as React from "react";

export interface HelloProps { compiler: string; framework: string; }

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

/* 记录鼠标点击事件 */
let logClicked = () => { console.log('click title'); };

// 取得防抖版的函数，里面有上一次延后执行的timeout的闭包
let logClickDebunce = debounce(logClicked, 500);

// 'HelloProps' describes the shape of props.
// State is never set so we use the '{}' type.
export class Hello extends React.Component<HelloProps, {}> {
	render() {
		return <>
			<h1 >Hello from {this.props.compiler} and {this.props.framework}!</h1>
			<div className="kk-img"></div>
			<span className="mayestica">Test Fonts</span>
			<br/>
			<button onClick={logClickDebunce}>click log mouse click action</button>
		</>;
	}
}