import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Lesson() {

    const { id } = useParams();
    const { number } = useParams();
    const [answer, setAnswer] = useState('')
    const [wrong1, setWrong1] = useState('')
    const [wrong2, setWrong2] = useState('')
    const [wrong3, setWrong3] = useState('')
    const [image, setImage] = useState('')
    const [next, setNext] = useState(Number(number) + 1)

    useEffect(() => {
        setNext(Number(number) + 1);
        console.log(number, next);
        // http://localhost:8080/lesson-test?lesson=1&number=1
        fetch(`http://localhost:8080/lesson-test?lesson=${id}&number=${number}`)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                setAnswer(data.answer);
                setWrong1(data.wrong1);
                setWrong2(data.wrong2);
                setWrong3(data.wrong3);
                setImage(data.image);
            });
    });

    return (
        <>
            <h1>About Page</h1>
            <Link to={`/lesson/${id}/${next}`}>{answer}</Link> <br />
            <Link to={`/lesson/${id}/${next}`}>{wrong1}</Link> <br />
            <Link to={`/lesson/${id}/${next}`}>{wrong2}</Link> <br />
            <Link to={`/lesson/${id}/${next}`}>{wrong3}</Link> <br />
        </>
    );
}

export default Lesson;
