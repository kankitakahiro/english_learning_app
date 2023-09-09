import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import Header from './Header';

export default function Result() {

    return (
        <>
            <Header />
            <p>お疲れ様でした。</p>
        </>
    );
}

