import * as React from "react";
import { NavLink } from "react-router-dom";

export class Navbar extends React.Component<{ title: String }, {}> {
	render() {
		return <>
			<nav className="navbar bg-dark navbar-dark">
				<a className="navbar-brand" href="#">{this.props.title}</a>
				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapsibleNavbar">
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="collapsibleNavbar">
					<ul className="navbar-nav">
						<li className="nav-item">
							<NavLink className="nav-link" to="/">Home</NavLink> <br />
						</li>
						<li className="nav-item">
							<NavLink className="nav-link" to="/about">About</NavLink> <br />
						</li>
						<li className="nav-item">
							<NavLink className="nav-link" to="/dashboard">Dashboard</NavLink> <br />
						</li>
					</ul>
				</div>
			</nav>
		</>;
	}
};
