import * as React from "react";
import { createRoot } from 'react-dom/client';

import { HashRouter, Route, Routes } from "react-router-dom"

import { Home } from './pages/home';
import { About } from './pages/about';
import { Dashboard } from './pages/dashboard';
import SandtableView from './pages/sandtable-view';

import '../styles/base.css';
import '../styles/h1.less';
import '../styles/image.less';
import '../styles/font.less';

let App = () => {
	return <HashRouter>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/sandtable" element={<SandtableView />} />
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/about" element={<About />} />
		</Routes>
	</HashRouter>
}

const container = document.getElementById('app-root');
const root = createRoot(container!);
root.render(<App></App>);
// export default App;