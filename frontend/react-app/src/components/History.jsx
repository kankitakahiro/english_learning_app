import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import Accordion from 'react-bootstrap/Accordion';

export default function Home() {

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

    const lessons = historyList.map(lesson =>
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
                                                <img src={question.image} />
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
            <ul>{lessons}</ul>
        </>
    );
}