import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Lesson from './components/Lesson';
import Result from './components/Result';
import './style.css';

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/lesson/:id/:number" element={<Lesson />} />
				<Route path="/lesson/:id/result/:score" element={<Result />} />
			</Routes>
		</Router>
	);
}