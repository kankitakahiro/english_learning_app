import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

/*
Top Page Component (pass:/) 
*/
export default function Home() {
    const lessonList = [
        { title: 'LESOON1', id: 1 },
        { title: 'LESSON2', id: 2 },
        { title: 'LESSON3', id: 3 },
        { title: 'LESSON4', id: 4 },
        { title: 'LESSON5', id: 5 },
    ];

    // Create lesson list in center of display
    const tlessons = lessonList.map(lesson =>
        < li key={lesson.id}>
            <Link to={`/tlesson/${lesson.id}/1`} className='lesson'>
                <span>{lesson.title}</span>
                <button className='btn-s'>PLAY</button>
            </Link>
        </li >
    );

    const ilessons = lessonList.map(lesson =>
        < li key={lesson.id}>
            <Link to={`/ilesson/${lesson.id}/1`} className='lesson2'>
                <span>{lesson.title}</span>
                <button className='btn-p'>PLAY</button>
            </Link>
        </li >
    );

    return (
        <>
            <main>
                <div className="logo-area">
                </div>
                <div className="select-lesson-area">
                    <span>image - text..</span>
                    <ul className='lessons'>{tlessons}</ul>
                </div>
                <div className="select-lesson-area">
                    <span>text - image..</span>
                    <ul className='lessons'>{ilessons}</ul>
                </div>
                <div className='footer-d'>
                    <div className='low-buttons'>
                        <Link to="/login" className='btn-p'>Login</Link>
                        <Link to="/history" className='btn-s'>History</Link>
                        {/* <Link to="/lesson/1/result" className='btn-p'>Settings</Link>
                        <Link to="/" className='btn-p'>Guide</Link>
                        <Link to="/login" className='btn-p'>ログイン</Link> */}
                    </div>
                </div>
            </main>
        </>
    );
}

