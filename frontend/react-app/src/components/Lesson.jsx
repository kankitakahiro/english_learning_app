import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';


export default function Lesson() {
    const { id } = useParams();
    const [words, setWords] = useState([]);
    const [answer, setAnswer] = useState('');
    const [image, setImage] = useState('');
    const [next, setNext] = useState(2);
    const [score, setScore] = useState(0);

    // function createSelects(selects) {
    //     const words = selects.map(word =>
    //         <li key={word.id}>
    //             <Link to={`/lesson/${id}/${next}`}>
    //                 <button onClick={() => handleAnswer(word.word)}>{word.word}</button>
    //             </Link>
    //         </li>
    //     );
    //     setWords(words);
    // }

    useEffect(() => {
        console.log("called")
        fetch(`http://localhost:8080/lesson-test?lesson=${id}&number=1`)
            .then(response => response.json())
            .then(data => {
                setAnswer(data.answer);
                // const selects = [
                //     { word: data.answer, id: 1 },
                //     { word: data.wrong1, id: 2 },
                //     { word: data.wrong2, id: 3 },
                //     { word: data.wrong3, id: 4 },
                // ];
                setWords([data.answer, data.wrong1, data.wrong2, data.wrong3]);
                setImage(data.image);
                // createSelects(selects);
            });
    }, []);

    function handleAnswer(word) {
        setNext(next + 1);
        if (word == answer) {
            console.log("correct");
            setScore(score + 1);
        } else {
            console.log("wrong")
        }
        console.log("user's ans", word);
        console.log("correct ans", answer);
        console.log("next", next);
        console.log("score", score);
        if (next == 11) {
            console.log("finish");
        } else {
            console.log("continue");
            // http://localhost:8080/lesson-test?lesson=1&number=1
            fetch(`http://localhost:8080/lesson-test?lesson=${id}&number=${next}`)
                .then(response => response.json())
                .then(data => {
                    setAnswer(data.answer)
                    setWords([data.answer, data.wrong1, data.wrong2, data.wrong3]);
                    setImage(data.image);
                    // const selects = [
                    //     { word: data.answer, id: 1 },
                    //     { word: data.wrong1, id: 2 },
                    //     { word: data.wrong2, id: 3 },
                    //     { word: data.wrong3, id: 4 },
                    // ];
                    // createSelects(selects);
                });
        }
    };

    return (
        <>
            <header></header>
            <main>
                <div className='lesson-header'>
                    <h1>LESSON{id}</h1>
                    <div>{next - 1}/10</div>
                </div>
                <img className='answer-img' src={image} /><br />
                <div className='select-answer-area'>
                    <span>Choose from below...</span>
                    <ul className='selects'>
                        <li><Link to={`/lesson/${id}/${next}`} onClick={() => handleAnswer(words[0])} className='word-area1'>{words[0]}</Link></li>
                        <li><Link to={`/lesson/${id}/${next}`} onClick={() => handleAnswer(words[1])} className='word-area2'>{words[1]}</Link></li>
                        <li><Link to={`/lesson/${id}/${next}`} onClick={() => handleAnswer(words[2])} className='word-area1'>{words[2]}</Link></li>
                        <li><Link to={`/lesson/${id}/${next}`} onClick={() => handleAnswer(words[3])} className='word-area2'>{words[3]}</Link></li>
                    </ul>
                </div>
                <div className='footer-s'>
                    <Link to="/" className='btn-p'>HOME</Link>
                </div>
            </main>
        </>
    );
}
