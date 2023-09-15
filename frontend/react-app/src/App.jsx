import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Ilesson from './components/Ilesson';
import Tlesson from './components/Tlesson';
import Tresult from './components/Tresult';
import Iresult from './components/Iresult';
import Sign from './components/Sign';
import History from './components/History';

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/tlesson/:id/:number" element={<Tlesson />} />
				<Route path="/ilesson/:id/:number" element={<Ilesson />} />
				<Route path="/tlesson/:id/result/:score" element={<Tresult />} />
				<Route path="/ilesson/:id/result/:score" element={<Iresult />} />
				<Route path="/sign" element={<Sign />} />
				<Route path="/history" element={<History />} />
			</Routes>
		</Router>
	);
}