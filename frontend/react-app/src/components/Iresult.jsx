import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import Header from './Header';


/*
Play Result Page Component (pass:/lesson/:lesson_id/:number) 
*/
export default function Iresult() {

    const { id } = useParams();
    const { score } = useParams();
    return (
        <>
            <Header />
            <main>
                <div className='ilesson-header'>
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
                        <Link to={`/ilesson/${id}/1`} className='btn-p'>Retry</Link>
                    </div>
                </div>
            </main>
        </>
    );
}

