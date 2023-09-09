import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

export default function Home() {
    const lessonList = [
        { title: 'LESOON1', id: 1 },
        { title: 'LESSON2', id: 2 },
        { title: 'LESSON3', id: 3 },
    ];

    const lessons = lessonList.map(lesson =>
        <li>
            <Link to={`/lesson/${lesson.id}/1`}>{lesson.title}</Link>
        </li>
    );

    return (
        <>
            <div className="home">
                <div className="logo-area border">
                    <h1>Vision</h1>
                </div>
                <div className="select-lesson-area">
                    <span>Let's Playing...</span>
                    <ul className='lessons'>{lessons}</ul>
                </div>
                <div className='low-buttons'>
                    <Link to="/setting" className='btn-p'>Settings</Link> <br />
                    <Link to="/guide" className='btn-p'>Guide</Link> <br />
                </div>
            </div>
        </>
    );
}

