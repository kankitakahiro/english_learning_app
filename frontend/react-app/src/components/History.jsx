import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
// import Modal from 'react-modal';
// import { customStyles } from './Modal';
import { REACT_APP_DEV_URL } from '..';
import Header from './Header';
import Accordion from 'react-bootstrap/Accordion';

export default function History() {

    // const [word, setWord] = useState('');
    // const [image, setImage] = useState('');
    const [history, setHistory] = useState([]);
    // const [showModal, setShowModal] = useState(false);

    const [imageSrc, setImageSrc] = useState('');

    useEffect(() => {
        const loadImage = async () => {
            try {
                const response = await fetch('/logo_sample.png');
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                setImageSrc(imageUrl);
            } catch (error) {
                console.error('画像の読み込みエラー:', error);
            }
        };
        loadImage();
    }, []);
    useEffect(() => {
        const retrievedToken = sessionStorage.getItem("authToken");
        const response = fetch(`${REACT_APP_DEV_URL}/history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': retrievedToken
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        else {
            const jsonData = response.json();
            setHistory(jsonData.history)
        }
    }, []);
    const historyList = [
        {
            title: 'LESOON1', questions: [
                { word: 'dog', image: 'hgeopaifjah' },
                { word: 'dog', image: 'hgeopaifjah' },
                { word: 'dog', image: 'hgeopaifjah' },
                { word: 'dog', image: 'hgeopaifjah' },
                { word: 'dog', image: 'hgeopaifjah' },
            ]
        },
        {
            title: 'LESSON2', questions: [
                { word: 'dog', image: 'hgeopaifjah' },
                { word: 'dog', image: 'hgeopaifjah' },
                { word: 'dog', image: 'hgeopaifjah' },
                { word: 'dog', image: 'hgeopaifjah' },
                { word: 'dog', image: 'hgeopaifjah' },
            ]
        },
    ];


    // function handleAdd(word, image) {
    //     setWord(word);
    //     setImage(image);
    //     showModal(true);
    // }

    const lessons = history.map(lesson =>
        < li key={lesson.title}>
            <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="1">
                    <Accordion.Header>{lesson.title}</Accordion.Header>
                    <Accordion.Body>
                        <ul>
                            {lesson.questions.map(question =>
                                <li key={question.word}>
                                    <Accordion defaultActiveKey="0">
                                        <Accordion.Item eventKey="1">
                                            <Accordion.Header>{question.word}</Accordion.Header>
                                            <Accordion.Body>
                                                <img src={question.image} alt={`${lesson.title}-${question.word}`} />
                                                {/* <button onClick={() => handleAdd(question.word, question.image)}>+</button> */}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </li>
                            )}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </li >
    );
    return (
        <>
            <Header imgUrl={imageSrc} />
            <p>Your Hisorys</p>
            <ul>{lessons}</ul>
            {/* <Modal
                isOpen={showModal}
                contentLabel="correctModal"
                style={customStyles}
            >
            </Modal> */}
            <div className='footer-s'>
                <Link to="/" className='btn-p'>HOME</Link>
            </div>

        </>
    );
}