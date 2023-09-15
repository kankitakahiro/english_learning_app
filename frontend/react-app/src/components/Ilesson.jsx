import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { customStyles } from './Modal';
import { REACT_APP_DEV_URL } from '..';
import Header from './Header';

/*
Playing Page Component (pass:/lesson/:lesson_id/:number) 
*/
export default function Ilesson() {

    const { id } = useParams();
    const [word, setWord] = useState('');
    let [answer, setAnswer] = useState(0);
    const [images, setImages] = useState([]);
    const [history, setHistory] = useState([]);
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
            fetch(`${REACT_APP_DEV_URL}/result`, {
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
            navigate(`/ilesson/${id}/result/${score}`);
        } else {
            fetch(`${REACT_APP_DEV_URL}/ilesson-test?lesson=${id}&number=${number}`)
                // fetch(`/lesson-test?lesson=${id}&number=1`)
                .then(response => response.json())
                .then(data => {
                    setAnswer(parseInt(data.ans));
                    setImages(data.images);
                    setWord(data.word);
                    setHistory([...history, data.history]);
                    navigate(`/ilesson/${id}/${number}`);
                }).catch((error) => {
                    console.log("エラ----------------");
                    console.error('Error:', error);
                });
        }
    }, [number]);


    // Called when User answer question after that Show modal
    function handleAnswer(word) {
        if (word == answer) {
            console.log("word:", word);
            console.log("answer",answer);
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
    }

    return (
        <>
            <Header />
            <main>
                <div className='ilesson-header'>
                    <h1>LESSON{id}</h1>
                    <div>{number - 1}/10</div>
                </div>
                <p className='answer-word-area'>{word}</p>
                <div className='select-answer-area'>
                    <span>Choose from below...</span>
                    <table className='answer-img-table'>
                        <tbody>
                            <tr>
                                <td><img src={images[0]} onClick={() => handleAnswer(0)} alt='answer-img1' /></td>
                                <td><img src={images[1]} onClick={() => handleAnswer(1)} alt='answer-img2' /></td>
                            </tr>
                            <tr>
                                <td><img src={images[2]} onClick={() => handleAnswer(2)} alt='answer-img3' /></td>
                                <td><img src={images[3]} onClick={() => handleAnswer(3)} alt='answer-img4' /></td>
                            </tr>
                        </tbody>
                    </table>
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
                    <img className='answer-img' src={images[answer]} alt='answer-img' /><br />
                    <p className='word-area1'>{word}</p>
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
                    <img className='answer-img' src={images[answer]} alt='answer-img' /><br />
                    <p className='word-area1'>{word}</p>
                </div>
            </Modal>
        </>
    );
}
