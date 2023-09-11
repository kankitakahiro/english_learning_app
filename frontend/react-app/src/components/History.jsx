import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';


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
            {lesson.title}
            <ul>
                {lesson.questions.map(question =>
                    <li key={question.word}>
                        {question.word}
                    </li>
                )}
            </ul>
        </li >
    );

    return (
        <>
            <ul>{lessons}</ul>
        </>
    );
}