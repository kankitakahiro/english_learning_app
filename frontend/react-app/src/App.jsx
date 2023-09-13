import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Ilesson from './components/Ilesson';
import Tlesson from './components/Tlesson';
import Result from './components/Result';
import Login from './components/Login';
import History from './components/History';
import { LoginForm } from './components/LoginForm';
import './style.css';

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/tlesson/:id/:number" element={<Tlesson />} />
				<Route path="/ilesson/:id/:number" element={<Ilesson />} />
				<Route path="/lesson/:id/result/:score" element={<Result />} />
				{/* <Route path="/login" element={<Login />} /> */}
				<Route path="/history" element={<History />} />
				<Route path="/login" element={<LoginForm />} />
			</Routes>
		</Router>
	);
}