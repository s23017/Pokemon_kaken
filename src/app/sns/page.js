"use client";

import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
const db = getFirestore(app);

export default function AuthPage() {
    const [isRegister, setIsRegister] = useState(false); // true: 新規登録, false: ログイン
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState(""); // 新規登録用のユーザー名
    const [error, setError] = useState("");
    const router = useRouter();

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (isRegister) {
                // 新規登録処理
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                // Firebase Authenticationのプロフィール更新
                await updateProfile(userCredential.user, { displayName: username });

                // Firestoreにユーザー情報を保存
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    username,
                    email,
                });

                alert("新規登録が完了しました！");
            } else {
                // ログイン処理
                const userCredential = await signInWithEmailAndPassword(auth, email, password);

                alert("ログイン成功！");
            }
            router.push("/sns/post"); // 投稿ページにリダイレクト
        } catch (err) {
            console.error("認証エラー:", err.message);
            setError(
                isRegister
                    ? "新規登録に失敗しました。入力内容を確認してください。"
                    : "ログインに失敗しました。メールアドレスとパスワードを確認してください。"
            );
        }
    };

    return (
        <div>
            {/* ヘッダー */}
            <header
                style={{
                    backgroundColor: "#FF0000",
                    color: "white",
                    textAlign: "center",
                    padding: "20px 0",
                    position: "relative",
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
                <h1 className="header-title">ログイン</h1>
            </header>

            {/* メインコンテンツ */}
            <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
                <h1>{isRegister ? "新規登録" : "ログイン"}</h1>
                <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column" }}>
                    {isRegister && (
                        <input
                            type="text"
                            placeholder="ユーザー名"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ marginBottom: "10px", padding: "10px" }}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ marginBottom: "10px", padding: "10px" }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="パスワード"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ marginBottom: "10px", padding: "10px" }}
                        required
                    />
                    <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
                        {isRegister ? "登録" : "ログイン"}
                    </button>
                </form>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <p style={{ marginTop: "20px" }}>
                    {isRegister
                        ? "すでにアカウントをお持ちの方は"
                        : "アカウントをお持ちでない方は"}{" "}
                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "blue",
                            cursor: "pointer",
                        }}
                    >
                        {isRegister ? "ログイン" : "新規登録"}
                    </button>
                </p>
            </div>

            <style jsx>{`
                .header-title {
                    font-size: 24px;
                }
            `}</style>
        </div>
    );
}
