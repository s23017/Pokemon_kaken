"use client";

import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import pokemonData from "../party-builder/data/Pokemon.json";
import "./styles.css";
import Link from "next/link";
import Image from "next/image";
import MiniBreakout from "./MiniBreakout";

const TOTAL_QUESTIONS = 10;
const MAX_LIVES = 3;
const RANKING_LIMIT = 5;

const auth = getAuth();
const db = getFirestore();

const SilhouetteQuiz = () => {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState("");
    const [currentPokemon, setCurrentPokemon] = useState(null);
    const [userInput, setUserInput] = useState("");
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [questionCount, setQuestionCount] = useState(1);
    const [ranking, setRanking] = useState([]);
    const [lives, setLives] = useState(MAX_LIVES);
    const [inputSuggestions, setInputSuggestions] = useState([]);
    const [showBreakout, setShowBreakout] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                await fetchUserData(firebaseUser.uid);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchUserData = async (uid) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            setUsername(userSnap.data().username || "");
            setLives(userSnap.data().lives || MAX_LIVES);
        } else {
            await setDoc(userRef, { username: user.displayName || "", lives: MAX_LIVES });
            setUsername(user.displayName || "");
            setLives(MAX_LIVES);
        }
    };

    const handleChange = (e) => {
        const value = e.target.value.trim();
        setUserInput(value);
        if (value.length === 0) {
            setInputSuggestions([]);
            return;
        }
        const filteredSuggestions = pokemonData
            .filter(pokemon => pokemon.name.jpn.startsWith(value))
            .map(pokemon => pokemon.name.jpn);
        setInputSuggestions(filteredSuggestions.slice(0, 5));
    };

    const updateLives = async (newLives) => {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { lives: newLives });
        setLives(newLives);
    };

    return (
        <div style={{ paddingTop: "120px" }}>
            <header style={{
                backgroundColor: "#FF0000",
                color: "white",
                textAlign: "center",
                padding: "20px 0",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                zIndex: 1000
            }}>
                <Link href="/top">
                    <Image src="/images/gaming.gif" width={50} height={50} alt="ホームに戻る"
                           style={{ position: "absolute", left: "20px", cursor: "pointer" }} />
                </Link>
                <h1 className="header-title">ポケモンシルエットクイズ</h1>
            </header>

            <div className="quiz-container">
                <h1>答えろ</h1>
                <p>スコア: {score}（連続正解ボーナス: {streak}）</p>
                <p>ライフ: {lives} / {MAX_LIVES} ❤️</p>
                <p>問題: {questionCount} / {TOTAL_QUESTIONS}</p>
                <input type="text" value={userInput} onChange={handleChange} placeholder="ポケモンの名前を入力" />
                {inputSuggestions.length > 0 && (
                    <ul className="suggestions">
                        {inputSuggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => setUserInput(suggestion)}>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
                <button onClick={() => updateLives(Math.max(lives - 1, 0))}>再挑戦（ライフ -1）</button>
                <button onClick={() => setShowBreakout(true)}>広告を見て回復</button>
                {showBreakout && <MiniBreakout onClose={() => setShowBreakout(false)} />}
            </div>
        </div>
    );
};

export default SilhouetteQuiz;
