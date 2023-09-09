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

    useEffect(() => {
        fetch(`http://localhost:8080/lesson-test?lesson=${id}&number=1`)
            .then(response => response.json())
            .then(data => {
                setAnswer(data.answer)
                setWords([data.answer, data.wrong1, data.wrong2, data.wrong3])
                setImage(data.image);
            });
    }, []);

    function handleAnswer(word) {
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
                    setWords([data.answer, data.wrong1, data.wrong2, data.wrong3])
                    setImage(data.image);
                });
        }
    };

    return (
        <>
            <Header />
            <img src={image} /><br />
            <Link to={`/lesson/${id}/${next}`}>
                <button onClick={() => handleAnswer(words[0])}>{words[0]}</button>
            </Link>
            <Link to={`/lesson/${id}/${next}`}>
                <button onClick={() => handleAnswer(words[1])}>{words[1]}</button>
            </Link>
            <Link to={`/lesson/${id}/${next}`}>
                <button onClick={() => handleAnswer(words[2])}>{words[2]}</button>
            </Link>
            <Link to={`/lesson/${id}/${next}`}>
                <button onClick={() => handleAnswer(words[3])}>{words[3]}</button>
            </Link>
        </>
    );
}
