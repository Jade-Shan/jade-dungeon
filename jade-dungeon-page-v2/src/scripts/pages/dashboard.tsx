import * as React from "react";
import { useLocation } from "react-router-dom"

import { Navbar } from "../ui/navbar";

export class Dashboard extends React.Component<{}, {}> {

	render() {
		return <>
			<Navbar title="Sand Table" />
			<div className="container-fluid">
				<h1>This is Dashboard Page </h1>
			</div>
		</>;
	}

};
