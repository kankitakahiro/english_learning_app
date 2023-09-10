import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './Header';


export default function Lesson() {
    const { id } = useParams();
    const [words, setWords] = useState([])
    const [answer, setAnswer] = useState('')
    const [image, setImage] = useState('')
    const [next, setNext] = useState(2)
    const [score, setScore] = useState(0)

    function createSelects(selects, id, next) {
        const words = selects.map(word =>
            <li>
                <Link to={`/lesson/${id}/${next}`}>
                    <button onClick={() => handleAnswer(word)}>{word}</button>
                </Link>
            </li>
        );
        setWords(words);
    }

    useEffect(() => {
        fetch(`http://localhost:8080/lesson-test?lesson=${id}&number=1`)
            .then(response => response.json())
            .then(data => {
                setAnswer(data.answer);
                const selects = [data.answer, data.wrong1, data.wrong2, data.wrong3];
                setImage(data.image);
                createSelects(selects, id, next);
            });
    }, []);

    function handleAnswer(word) {
        console.log(word, answer);
        console.log(next);
        console.log(score);
        if (word == answer) {
            console.log("correct");
            setScore(score + 1);
        } else {
            console.log("wrong")
        }
        setNext(next + 1);
        if (next == 11) {
            console.log("finish");
        } else {
            console.log("continue");
            // http://localhost:8080/lesson-test?lesson=1&number=1
            fetch(`http://localhost:8080/lesson-test?lesson=${id}&number=${next}`)
                .then(response => response.json())
                .then(data => {
                    setAnswer(data.answer)
                    const selects = [data.answer, data.wrong1, data.wrong2, data.wrong3];
                    setImage(data.image);
                    console.log(next)
                    createSelects(selects, id, next);
                });
        }
    };

    return (
        <>
            <Header />
            <img src={image} /><br />
            <div className='select-answer-area'>
                <ul className='selects'>{words}</ul>
            </div>
        </>
    );
}
