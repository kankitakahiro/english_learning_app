import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import Lesson from './Lesson';
import './App.css'

// 画面（ページ）のコンポーネント
function Home() {
	const lesson_numbers = [1, 2, 3]
	return (
		<>
			<div className="logo-area border">
				<h1>Home Page</h1>
			</div>
			<div className="select-lesson-area">
				<span>Let's Playing...</span>
				<div className='lessons'>
					<Link to={`/lesson/${lesson_numbers[0]}/${1}`}>Lesson 1</Link> <br />
					<Link to="/lesson/2/1">Lesson 2</Link> <br />
					<Link to="/lesson/3/1">Lesson 3</Link>
				</div>
			</div>
			<div>
				<Link to="/setting">Settings</Link> <br />
				<Link to="/guide">Guide</Link> <br />
			</div>
		</>
	);
}

function App() {
	return (
		<Router>
			{/* ルートの設定 */}
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/lesson/:id/:number" element={<Lesson />} />
			</Routes>
		</Router>
	);
}
export default App;