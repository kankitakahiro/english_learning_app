import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';


/*
Play Result Page Component (pass:/lesson/:lesson_id/:number) 
*/
export default function Result() {

    const { id } = useParams();
    const { score } = useParams();
    return (
        <>
            <header></header>
            <main>
                <div className='tlesson-header'>
                    <h1>LESSON{id}</h1>
                </div>
                <div className='your-score-area'>
                    <span className='score-row-1'>your score</span>
                    <div className='score-row-2'>
                        <div>
                            <span className='is'>is</span>
                            <span className='score'>{score}/10</span>
                        </div>
                    </div>
                </div>
                <div className='footer-d'>
                    <div className='low-buttons'>
                        <Link to="/" className='btn-p'>HOME</Link>
                        <Link to={`/lesson/${id}/1`} className='btn-p'>Retry</Link>
                    </div>
                </div>
            </main>
        </>
    );
}

