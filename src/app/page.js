"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import Cookies from "js-cookie";

// Firebaseの設定情報
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH,
    projectId: process.env.NEXT_PUBLIC_PRO,
    storageBucket: process.env.NEXT_PUBLIC_BUKET,
    messagingSenderId: process.env.NEXT_PUBLIC_POKEMON_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);

    // Firebaseの認証状態を監視
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                Cookies.set("user", JSON.stringify(currentUser), { expires: 7 });
                window.location.href = "/top";
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    // メールアドレスとパスワードでログイン
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("メールアドレスとパスワードを入力してください。");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            alert("ログイン成功！");
            Cookies.set("user", JSON.stringify(userCredential.user), { expires: 7 });
            window.location.href = "/top";
        } catch (error) {
            console.error("ログイン失敗", error);
            setError("メールアドレスまたはパスワードが間違っています。");
        }
    };

    // Googleでログイン
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            alert("Googleログイン成功！");
            Cookies.set("user", JSON.stringify(result.user), { expires: 7 });
            window.location.href = "https://pokemon-kaken.vercel.app/sns/post";
        } catch (error) {
            console.error("Googleログイン失敗", error);
            setError("Googleログインに失敗しました。");
        }
    };

    // ログアウト
    const handleLogout = () => {
        signOut(auth).then(() => {
            Cookies.remove("user");
            setUser(null);
            window.location.href = "/";
        }).catch((error) => {
            console.error("ログアウト失敗", error);
        });
    };

    return (
        <div style={{
            backgroundColor: "#f7f7f7",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
        }}>
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
                            style={{cursor: "pointer"}}
                        />
                    </Link>
                </div>
                <h1 className="header-title">SNSログイン</h1>
            </header>

            {/* メインコンテンツ */}
            <div style={{
                maxWidth: "400px",
                padding: "30px",
                backgroundColor: "white",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
                marginTop: "100px"
            }}>
                <h2 style={{marginBottom: "20px", color: "#333"}}>ログイン</h2>
                {user ? (
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: "10px",
                            fontSize: "16px",
                            backgroundColor: "gray",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        ログアウト
                    </button>
                ) : (
                    <>
                        <form onSubmit={handleLogin} style={{display: "flex", flexDirection: "column"}}>
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
                            <button type="submit" style={{
                                padding: "10px",
                                fontSize: "16px",
                                backgroundColor: "red",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}>
                                ログイン
                            </button>
                        </form>
                        <button
                            onClick={handleGoogleLogin}
                            style={{
                                marginTop: "15px",
                                padding: "10px",
                                fontSize: "16px",
                                backgroundColor: "#4285F4",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Googleでログイン
                        </button>
                        {error && <p style={{color: "red", marginTop: "10px"}}>{error}</p>}
                        <p style={{marginTop: "20px", color: "#555"}}>
                            アカウントをお持ちでない方は
                            <Link href="/sns/register" style={{color: "red", textDecoration: "underline", marginLeft: "5px"}}>
                                新規登録
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
