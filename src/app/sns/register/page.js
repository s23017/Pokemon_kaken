"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { initializeApp } from "firebase/app";

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

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: username });
            alert("新規登録成功！");
            window.location.href = "/sns"; // 投稿画面にリダイレクト
        } catch (err) {
            console.error("登録エラー", err);
            setError("新規登録に失敗しました。もう一度お試しください。");
        }
    };

    return (
        <div style={{ backgroundColor: "#f7f7f7", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            {/* ヘッダー */}
            <header
                style={{
                    backgroundColor: "red",
                    color: "white",
                    textAlign: "center",
                    padding: "20px 0",
                    position: "fixed",
                    top: "0",
                    left: "0",
                    width: "100%",
                    zIndex: "1000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: "20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                    }}
                >
                    <Link href="/">
                        <Image
                            src="/images/gaming.gif"
                            width={50}
                            height={50}
                            alt="ホームに戻る"
                            style={{ cursor: "pointer" }}
                        />
                    </Link>
                </div>
                <h1 className="header-title">新規登録</h1>
            </header>

            {/* メインコンテンツ */}
            <div style={{ maxWidth: "400px", padding: "30px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", textAlign: "center", marginTop: "100px" }}>
                <h2 style={{ marginBottom: "20px", color: "#333" }}>新規登録</h2>
                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column" }}>
                    <input
                        type="text"
                        placeholder="ユーザー名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            marginBottom: "15px",
                            padding: "10px",
                            fontSize: "16px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                        }}
                        required
                    />
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            marginBottom: "15px",
                            padding: "10px",
                            fontSize: "16px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                        }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="パスワード"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            marginBottom: "15px",
                            padding: "10px",
                            fontSize: "16px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                        }}
                        required
                    />
                    <button
                        type="submit"
                        style={{
                            padding: "10px",
                            fontSize: "16px",
                            backgroundColor: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        登録
                    </button>
                </form>
                {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
                <p style={{ marginTop: "20px", color: "#555" }}>
                    すでにアカウントをお持ちの方は
                    <Link href="/sns" style={{ color: "red", textDecoration: "underline", marginLeft: "5px" }}>
                        ログイン
                    </Link>
                </p>
            </div>

            <style jsx>{`
                .header-title {
                    font-size: 24px;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
}
