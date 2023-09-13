import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
// import { auth } from '../firebase';


export default function Login() {
    const handleLogin = (event) => {
        // event.preventDefault();
        // const { email, password } = event.target.elements;
        // auth.createUserWithEmailAndPassword(email.value, password.value);
    };

    return (
        <>
            <header></header>
            <main className='login'>
                <form className='login-form' onSubmit={handleLogin}>
                    <div className='form-item'>
                        <label htmlFor="email">Email</label>
                        <input type="email" className='form-c' name="email" id="email" />
                    </div>
                    <div className='form-item'>
                        <label htmlFor="password">Password</label>
                        <input type="password" className='form-c' name="password" id="password" />
                    </div>
                    <div className='low-buttons'>
                        <Link to="/" className='btn-s'>HOME</Link>
                        <button className='btn-p'>Login</button>
                    </div>
                </form>
            </main >
        </>
    );
}