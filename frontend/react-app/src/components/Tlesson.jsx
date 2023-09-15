import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { customStyles } from './Modal';
import { REACT_APP_DEV_URL } from '..';
/*
Playing Page Component (pass:/lesson/:lesson_id/:number) 
*/
export default function Tlesson() {

    const { id } = useParams();
    const [words, setWords] = useState([]);
    const [history, setHistory] = useState([]);
    const [answer, setAnswer] = useState('');
    const [image, setImage] = useState('');
    const [number, setNumber] = useState(1);
    const [score, setScore] = useState(0);
    const navigate = useNavigate();

    // Decide whether or not to show the modal and Difine modal's design 
    const [showCorrectModal, setShowCorrectModal] = useState(false);
    const [showWrongModal, setShowWrongModal] = useState(false);

    // Called only at first
    // Get words and image from backend;
    useEffect(() => {
        if (number === 11) {
            const retrievedToken = sessionStorage.getItem("authToken");
            fetch(`${REACT_APP_DEV_URL}/verifyToken`, {
                // const response = await fetch('http://localhost:8080/verifyToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': retrievedToken
                },
                body: {
                    id: id,
                    history: history
                },
            });
            navigate(`/tlesson/${id}/result/${score}`);
        } else {
            fetch(`${REACT_APP_DEV_URL} / tlesson - test ? lesson = ${id} & number=${number}`)
                // fetch(`/ lesson - test ? lesson = ${ id } & number=${ number }`)
                .then(response => response.json())
                .then(data => {
                    setAnswer(data.ans);
                    setWords(data.item_list);
                    setImage(data.image);
                    setHistory(...history, data.history)
                    navigate(`/ tlesson / ${id} / ${number}`);
                });
        }
    }, [number]);

    // Called when User answer question after that Show modal
    function handleAnswer(word) {
        if (word === answer) {
            setScore(score + 1);
            setShowCorrectModal(true);
        } else {
            setShowWrongModal(true);
        }
    };

    /*
    Called when User click modal 
    ->Get next question's words and image from backend;
    */
    function handleNext() {
        setShowCorrectModal(false);
        setShowWrongModal(false);
        setNumber(number + 1);
    };

    return (
        <>
            <header></header>
            <main>
                <div className='tlesson-header'>
                    <h1>LESSON{id}</h1>
                    <div>{number}/10</div>
                </div>
                <img className='answer-img' src={image} alt='answer-img' /><br />
                <div className='select-answer-area'>
                    <span>Choose from below...</span>
                    <ul className='selects'>
                        <li onClick={() => handleAnswer(words[0])} className='word-area1'>{words[0]}</li>
                        <li onClick={() => handleAnswer(words[1])} className='word-area2'>{words[1]}</li>
                        <li onClick={() => handleAnswer(words[2])} className='word-area1'>{words[2]}</li>
                        <li onClick={() => handleAnswer(words[3])} className='word-area2'>{words[3]}</li>
                    </ul>
                </div>
                <div className='footer-s'>
                    <Link to="/" className='btn-p'>HOME</Link>
                </div>
            </main>

            <Modal
                id='correctModal'
                isOpen={showCorrectModal}
                contentLabel="correctModal"
                style={customStyles}
            >
                <div onClick={() => handleNext()} className='correctModal'>
                    <h2>Correct!</h2>
                    <img className='answer-img' src={image} alt='answer-img' /><br />
                    <p className='word-area1'>{answer}</p>
                </div>
            </Modal>

            <Modal
                id='wrongModal'
                isOpen={showWrongModal}
                contentLabel="WrongModal"
                style={customStyles}
            >
                <div onClick={() => handleNext()} className='WrongModal'>
                    <h2>Wrong</h2>
                    <img className='answer-img' src={image} alt='answer-img' /><br />
                    <p className='word-area1'>{answer}</p>
                </div>
            </Modal>
        </>
    );
}
