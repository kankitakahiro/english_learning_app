import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import Header from './Header';
import { useEffect, useState } from 'react';


/*
Play Result Page Component (pass:/lesson/:lesson_id/:number) 
*/
export default function Iresult() {

    const { id } = useParams();
    const { score } = useParams();
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
    return (
        <>
            <Header imgUrl={imageSrc} />
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

