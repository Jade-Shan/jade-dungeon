import * as React from "react";
import { createRoot } from 'react-dom/client';

import { MemoryRouter, HashRouter, BrowserRouter, Route, Routes, useLocation } from "react-router-dom"

import { Hello } from "./components/Hello";
import {Navbar} from "./ui/navbar";

import '../styles/base.css';
import '../styles/h1.less';
import '../styles/image.less';
import '../styles/font.less';

let App = () => {
	return <HashRouter>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/about" element={<About />} />
			<Route path="/dashboard" element={<Dashboard />} />
		</Routes>
	</HashRouter>
}

let Home = () => {
	return <>
		<Navbar title="Sand Table" />
		<div className="container-fluid">
			<Hello compiler="TypeScript" framework="React" />
		</div>
	</>;
}
let About = () => {
	let location = useLocation();
	let pathName = location.pathname;
	return <>
		<Navbar title="Sand Table" />
		<h1>This is About Page {pathName}</h1>
		<br />
	</>;
}

let Dashboard = () => {
	let location = useLocation();
	let pathName = location.pathname;
	return <>
		<Navbar title="Sand Table" />
		<h1>This is Dashboard Page {pathName}</h1>
		<br />
	</>
}


const container = document.getElementById('app-root');
const root = createRoot(container!);
root.render(<App></App>);
// export default App;