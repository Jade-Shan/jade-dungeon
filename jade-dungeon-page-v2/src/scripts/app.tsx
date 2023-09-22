import * as React from "react";
import { createRoot } from 'react-dom/client';

import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom"

import { Hello } from "./components/Hello";

import '../styles/base.css';
import '../styles/h1.less';
import '../styles/image.less';
import '../styles/font.less';

let App = () => {
	return <BrowserRouter>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/about" element={<About />} />
			<Route path="/dashboard" element={<Dashboard />} />
		</Routes>
	</BrowserRouter>
}

let Home = () => {
	let location = useLocation();
	let pathName = location.pathname;
	return <>
		<h1>This is Home Page {pathName}</h1>
		<br />
		<NavLink to="/">Home</NavLink> <br />
		<NavLink to="/about">About</NavLink> <br />
		<NavLink to="/dashboard">Dashboard</NavLink> <br />
	</>;
}
let About = () => {
	return <>
		<Hello compiler="TypeScript" framework="React" />
		<br />
		<NavLink to="/">Home</NavLink> <br />
		<NavLink to="/about">About</NavLink> <br />
		<NavLink to="/dashboard">Dashboard</NavLink> <br />
	</>;
}

let Dashboard = () => {
	let location = useLocation();
	let pathName = location.pathname;
	return <>
		<h1>This is Dashboard Page {pathName}</h1>
		<br />
		<NavLink to="/">Home</NavLink> <br />
		<NavLink to="/about">About</NavLink> <br />
		<NavLink to="/dashboard">Dashboard</NavLink> <br />
	</>
}


const container = document.getElementById('example');
const root = createRoot(container!);
root.render(<App></App>);
// export default App;