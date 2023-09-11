import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';

/*
Playing Page Component (pass:/lesson/:lesson_id/:number) 
*/
export default function Lesson() {

    const { id } = useParams();
    const [words, setWords] = useState([]);
    const [answer, setAnswer] = useState('');
    const [image, setImage] = useState('');
    const [next, setNext] = useState(2);
    const [score, setScore] = useState(0);
    const navigate = useNavigate();

    // Decide whether or not to show the modal and Difine modal's design 
    const [showCorrectModal, setShowCorrectModal] = useState(false);
    const [showWrongModal, setShowWrongModal] = useState(false);

    const customStyles = {
        content: {
            top: '40%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            border: '1rem solid !important'
        },
    };

    // Called only at first
    // Get words and image from backend;
    useEffect(() => {
        fetch(`http:/localhost:8080/lesson-test?lesson=${id}&number=1`)
            // fetch(`/lesson-test?lesson=${id}&number=1`)
            .then(response => response.json())
            .then(data => {
                setAnswer(data.answer);
                setWords([data.answer, data.wrong1, data.wrong2, data.wrong3]);
                setImage(data.image);
            });
    }, [id]);

    // Called when User answer question after that Show modal
    function handleAnswer(word) {
        setNext(next + 1);
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
        if (next === 11) {
            navigate(`/lesson/${id}/result/${score}`);
        } else {
            // http://localhost:8080/lesson-test?lesson=1&number=1
            fetch(`http://localhost:8080/lesson-test?lesson=${id}&number=${next}`)
                .then(response => response.json())
                .then(data => {
                    setAnswer(data.answer)
                    setWords([data.answer, data.wrong1, data.wrong2, data.wrong3]);
                    setImage(data.image);
                    navigate(`/lesson/${id}/${next}`);
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
                    <img className='answer-img' src={image} /><br />
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
                    <img className='answer-img' src={image} /><br />
                    <p className='word-area1'>{answer}</p>
                </div>
            </Modal>
        </>
    );
}
