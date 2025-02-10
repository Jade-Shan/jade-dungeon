import * as React from "react";

import { Navbar } from "../ui/navbar";

export class About extends React.Component<{}, {}> {

	render() {
		return <>
			<Navbar title="Sand Table" />
			<div className="container-fluid">
				<h1>This is About Page </h1>
			</div>
		</>;
	}

};
