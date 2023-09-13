import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

export default function Home() {
    const lessonList = [
        { title: 'LESOON1', id: 1 },
        { title: 'LESSON2', id: 2 },
        { title: 'LESSON3', id: 3 },
        { title: 'LESSON4', id: 4 },
        { title: 'LESSON5', id: 5 },
    ];

    const lessons = lessonList.map(lesson =>
        < li key={lesson.id}>
            <Link to={`/lesson/${lesson.id}/1`} className='lesson'>
                <span>{lesson.title}</span>
                <button className='btn-s'>PLAY</button>
            </Link>
        </li >

    );

    return (
        <>
            <main>
                <div className="logo-area">
                </div>
                <div className="select-lesson-area">
                    <span>Let's Play...</span>
                    <ul className='lessons'>{lessons}</ul>
                </div>
                <div className='footer-d'>
                    <div className='low-buttons'>
                        <Link to="/lesson/1/result" className='btn-p'>Settings</Link>
                        <Link to="/" className='btn-p'>Guide</Link>
                        <Link to="/login" className='btn-p'>ログイン</Link>
                    </div>
                </div>
            </main>
        </>
    );
}

