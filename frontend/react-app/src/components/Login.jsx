import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';


export default function Login() {
    return (
        <>
            <header></header>
            <main className='login'>
                <form className='login-form' action="http://localhost:8080" method='POST'>
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
                        <input className='btn-p' type="submit" />
                    </div>
                </form>
            </main >
        </>
    );
}