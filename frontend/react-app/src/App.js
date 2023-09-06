import './App.css';

function App() {


	const lessonStart = (les_number) {
		fetch('/lesson-test?lesson_number', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(newTask),
		})
			.then(response => {
				if (response.ok) {
					window.location.replace('/todo');
				}
			})
			.catch(error => console.error('Error:', error));
	}

	return (
		<div className="App">
			<div class="logo-area border">
			</div>
			<div class="select-lesson-area">
				<span>Let's Playing...</span>
				<ol class="lessons">
					<li class="lesson">
						<button onClick={lessonStart(1)}>LESSON1</button>
					</li>
				</ol>
			</div>
			<div>
				<button>設定</button>
				<button>使い方</button>
			</div>
		</div>
	);
}

export default App;
