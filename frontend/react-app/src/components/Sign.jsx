// LoginForm.js
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { auth } from './firebaseConfig';
import Modal from 'react-modal';
import { customStyles } from './Modal';
import { REACT_APP_DEV_URL } from '..';
import Header from './Header';

export default function Sign() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    function closeModal() {
        setShowModal(false);
        setMessage('');
    }

    const handleSubmitSingIn = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            console.log(token);
            console.log(userCredential.user);

            // トークンをバックエンドに送信
            // http://localhost:8080/verifyToken
            const response = await fetch(`${REACT_APP_DEV_URL}/verifyToken`, {
                // const response = await fetch('http://localhost:8080/verifyToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                // body: JSON.stringify({ token }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Server response:", data);
                setMessage("ログインに成功しました。");
                sessionStorage.setItem("authToken", token);
            } else {
                setMessage("ログインに失敗しました。");
                console.error("Failed to verify token on the server");
            }
        } catch (error) {
            setMessage("ログイン中にエラーが起きました。");
            console.error("Error logging in: ", error);
        }
        setShowModal(true)
    };

    const handleSubmitSignUp = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setMessage('登録に成功しました。');
            // 必要に応じて、ここで追加のユーザー情報をデータベースに保存するなどの処理を行うことができます。
        } catch (error) {
            console.error("Error signing up: ", error);
            setMessage('登録に失敗しました。' + error.message);
        }
        setShowModal(true)
    };

    return (
        <>
            <Header />
            <main className='sign'>
                <div>
                    <form onSubmit={handleSubmitSingIn} className='login-form'>
                        <p>Sing in</p>
                        <div className='form-item'>
                            <label htmlFor="email">Email</label><br />
                            <input
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                type="email"
                                placeholder="Email"
                                className='form-c'
                            />
                        </div>
                        <div className='form-item'>
                            <label htmlFor="password">Password</label><br />
                            <input
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                type="password"
                                placeholder="Password"
                                className='form-c'
                            />
                        </div>
                        <button type="submit" className='btn-p'>Login</button>
                    </form>
                </div>

                <div>
                    <form onSubmit={handleSubmitSignUp} className='login-form'>
                        <p>Sign Up</p>
                        <div className='form-item'>
                            <label htmlFor="email">Email</label><br />
                            <input
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                type="email"
                                placeholder="Email"
                                className='form-c'
                            />
                        </div>
                        <div className='form-item'>
                            <label htmlFor="password">Password</label><br />
                            <input
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                type="password"
                                placeholder="Password"
                                className='form-c'
                            />
                        </div>
                        <button type="submit" className='btn-p'>Register</button>
                    </form>
                </div>
            </main >
            <div className='footer-s'>
                <Link to="/" className='btn-p'>HOME</Link>
            </div>

            <Modal
                isOpen={showModal}
                contentLabel="singedModal"
                style={customStyles}
                onRequestClose={closeModal}

            >
                <div>
                    <p>{message}</p>
                    <div className='low-buttons'>
                        <Link to="/" className='btn-p'>HOME</Link>
                        <button className='btn-s' onClick={closeModal}>Close</button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

