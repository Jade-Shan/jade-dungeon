import * as React from "react";

import { Hello } from "../components/Hello";
import { Navbar } from "../ui/navbar";

export class Home extends React.Component<{}, {}> {
	render() {
		return <>
			<Navbar title="Sand Table" />
			<div className="container-fluid">
				<Hello compiler="TypeScript" framework="React" />
			</div>
		</>;
	}
};
