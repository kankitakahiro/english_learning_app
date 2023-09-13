// LoginForm.js
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';


function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmitSingIn = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      console.log(token);
      console.log("----------------");
      console.log(userCredential.user);

      // トークンをバックエンドに送信
      // http://localhost:8080/verifyToken
      const response = await fetch('/verifyToken', {
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

      // ここでtokenをバックエンドに送信して確認できます。
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setMessage('登録に成功しました！');

      // 必要に応じて、ここで追加のユーザー情報をデータベースに保存するなどの処理を行うことができます。
    } catch (error) {
      console.error("Error signing up: ", error);
      setMessage('登録に失敗しました：' + error.message);
    }
  };

  return (
    <>
    <div>
    <h1>ログイン</h1>
    
    <form onSubmit={handleSubmitSingIn}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        type="email"
        placeholder="Email"
      />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>

    </div>

    <div>
    <h1>新規登録</h1>
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        type="email"
        placeholder="Email"
      />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
      />
      <button type="submit">登録</button>
    </form>
    {message && <p>{message}</p>}
    </div>
    </>
  );
}

export { LoginForm };
