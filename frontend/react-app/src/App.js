// // import logo from './logo.svg';
// import './App.css';
// import 

// function App() {
//   const lessonStart = (les_number) => {
// 		fetch(`/lesson-test?lesson_number=${les_number}`)
//     .then(response => {
// 				if (response.ok) {
// 					// window.location.replace('/todo');
// 				}
// 			})
// 			.catch(error => console.error('Error:', error));
// 	}

// 	return (
// 		<div className="App">
// 			<div class="logo-area border">
// 			</div>
// 			<div class="select-lesson-area">
// 				<span>Let's Playing...</span>
// 				<ol class="lessons">
// 					<li class="lesson">
// 						<button onClick={lessonStart(1)}>LESSON1</button>
// 					</li>
// 				</ol>
// 			</div>
// 			<div>
// 				<button>設定</button>
// 				<button>使い方</button>
// 			</div>
// 		</div>
// 	);
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams} from 'react-router-dom';
import { useEffect, useState } from 'react';

// 画面（ページ）のコンポーネント
function Home() {
  return (
    <>  
    <h1>Home Page</h1>
    <Link to="/lesson/1/1">Lesson 1</Link> <br/>
    <Link to="/lesson/2/1">Lesson 2</Link> <br/>
    <Link to="/lesson/3/1">Lesson 3</Link>
    </>
  );
}

function Lesson() {

  const { id }= useParams();
  const { number }= useParams();

  const [moji, setMoji] = useState('')

  useEffect(() => {
    console.log("Home");
    console.log(id, number);
    // http://localhost:8080/lesson-test?lesson=1&number=1
    fetch(`http://localhost:8080/lesson-test?lesson=${id}&number=${number}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setMoji(data.answer);
      });
  }, []);

  return (
    <>
    <h1>About Page</h1>
    <Link to="/">Home</Link>
    <p>{moji}</p>
    </>
  );
}


function App() {
  return (
    <Router>
      {/* ルートの設定 */}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/lesson/:id/:number" element={<Lesson/>} />
      </Routes>
    </Router>
  );
}
export default App;