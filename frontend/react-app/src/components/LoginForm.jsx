// LoginForm.js
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { auth } from './firebaseConfig';
import Modal from 'react-modal';
import { customStyles } from './Modal';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmitSingIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      console.log(token);
      console.log(userCredential.user);

      // トークンをバックエンドに送信
      // http://localhost:8080/verifyToken
      const response = await fetch(`${process.env.REACT_APP_DEV_URL}/verifyToken`, {
        // const response = await fetch('http://localhost:8080/verifyToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Server response:", data);
      } else {
        console.error("Failed to verify token on the server");
      }
    } catch (error) {
      console.error("Error logging in: ", error);
    }
    setShowModal(true)
  };

  const handleSubmitSignUp = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setMessage('You are Success for Sign Up!');
      // 必要に応じて、ここで追加のユーザー情報をデータベースに保存するなどの処理を行うことができます。
    } catch (error) {
      console.error("Error signing up: ", error);
      setMessage('You are Failed to Sign Up' + error.message);
    }
    setShowModal(true)
  };

  return (
    <><header></header>
      <main >
        <p className="message">{message}</p>
        <div>
          <h1>Login</h1>
          <form onSubmit={handleSubmitSingIn} className='login-form'>
            <div className='form-item'>
              <label htmlFor="email">Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
              />
            </div>
            <div className='form-item'>
              <label htmlFor="password">Password</label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
              />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>

        <div>
          <h1>Sign Up</h1>
          <form onSubmit={handleSubmitSignUp} className='login-form'>
            <div className='form-item'>
              <label htmlFor="email">Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
              />
            </div>
            <div className='form-item'>
              <label htmlFor="password">Password</label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
              />
            </div>
            <button type="submit">Register</button>
          </form>
        </div>
      </main >

      <Modal
        isOpen={showModal}
        contentLabel="correctModal"
        style={customStyles}
      >
        <div>
          <p>{message}</p>
          <Link to="/" className='btn-p'>HOME</Link>
        </div>
      </Modal>
    </>
  );
}

