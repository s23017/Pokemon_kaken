"use client";

import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH,
    projectId: process.env.NEXT_PUBLIC_PRO,
    storageBucket: process.env.NEXT_PUBLIC_BUKET,
    messagingSenderId: process.env.NEXT_PUBLIC_POKEMON_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegister) {
                await createUserWithEmailAndPassword(auth, email, password);
                alert('アカウントが作成されました！');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                alert('ログイン成功！');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
            <h1>{isRegister ? '新規登録' : 'ログイン'}</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <input
                    type="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ marginBottom: '10px', padding: '10px' }}
                    required
                />
                <input
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ marginBottom: '10px', padding: '10px' }}
                    required
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
                    {isRegister ? '登録する' : 'ログイン'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <p>
                {isRegister ? 'アカウントを持っている場合' : 'アカウントを持っていない場合'}{' '}
                <button
                    onClick={() => setIsRegister(!isRegister)}
                    style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
                >
                    {isRegister ? 'ログインする' : '新規登録'}
                </button>
            </p>
        </div>
    );
}
