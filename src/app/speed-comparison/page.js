"use client";

import React, {useState, useEffect, useRef} from "react";
import pokemonData from "../party-builder/data/Pokemon.json";
import "./styles.css";
import Link from "next/link";
import Image from "next/image";
import MiniBreakout from "./MiniBreakout";


const TOTAL_QUESTIONS = 10;
const MAX_LIVES = 3;
const RANKING_LIMIT = 5;

const SilhouetteQuiz = () => {
    const [showBreakout, setShowBreakout] = useState(true);
    const [username, setUsername] = useState("");
    const [isUsernameSet, setIsUsernameSet] = useState(false);
    const [currentPokemon, setCurrentPokemon] = useState(null);
    const [userInput, setUserInput] = useState("");
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [questionCount, setQuestionCount] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [ranking, setRanking] = useState([]);
    const [lives, setLives] = useState(MAX_LIVES);
    const [inputSuggestions, setInputSuggestions] = useState([]);

    useEffect(() => {
        if (isUsernameSet) {
            pickRandomPokemon(false);
            loadRanking();
        }
    }, [isUsernameSet]);

    const loadRanking = () => {
        const storedRanking = JSON.parse(localStorage.getItem("pokemon_quiz_ranking")) || [];
        setRanking(storedRanking);
    };

    const pickRandomPokemon = (incrementCount = true) => {
        if (questionCount > TOTAL_QUESTIONS) {
            setGameOver(true);
            updateRanking();
            return;
        }
        const randomIndex = Math.floor(Math.random() * pokemonData.length);
        setCurrentPokemon(pokemonData[randomIndex]);
        setShowAnswer(false);
        setUserInput("");
        setInputSuggestions([]); // ✨ 予測変換リストをクリア
        if (incrementCount) setQuestionCount(prev => prev + 1);
    };


    const handleChange = (e) => {
        const value = e.target.value.trim();
        setUserInput(value);

        if (value.length === 0) {
            setInputSuggestions([]);
            return;
        }

        console.log("入力値:", value); // 🔍 デバッグ用ログ

        // ポケモンの名前で前方一致検索
        const filteredSuggestions = pokemonData
            .filter(pokemon => pokemon.name.jpn.startsWith(value))
            .map(pokemon => pokemon.name.jpn);

        console.log("予測変換候補:", filteredSuggestions); // 🔍 デバッグ用ログ

        setInputSuggestions(filteredSuggestions.slice(0, 5)); // 上位5件のみ表示
    };


    const checkAnswer = () => {
        if (userInput === currentPokemon.name.jpn) {
            setShowAnswer(true);
            setScore(prev => prev + 10 + streak * 2);
            setStreak(prev => prev + 1);
        } else {
            setShowAnswer(true);
            setStreak(0);
            setLives(prev => Math.max(prev - 1, 0)); // ライフ減少
        }
        setTimeout(() => {
            pickRandomPokemon(true);
            setInputSuggestions([]); // ✨ 回答後に予測変換をリセット
        }, 2000);    };

    const skipQuestion = () => {
        setShowAnswer(true);
        setStreak(0);
        setTimeout(() => {
            pickRandomPokemon(true);
            setInputSuggestions([]); // ✨ スキップ後に予測変換をリセット
        }, 2000);
    };

    const handleUsernameSubmit = () => {
        if (username.trim()) {
            setIsUsernameSet(true);
        }
    };

    const updateRanking = () => {
        const newRanking = [...ranking, {name: username, score}]
            .sort((a, b) => b.score - a.score)
            .slice(0, RANKING_LIMIT);
        setRanking(newRanking);
        localStorage.setItem("pokemon_quiz_ranking", JSON.stringify(newRanking));
    };

    const watchAdToRecoverLife = () => {
        setIsWatchingAd(true);
        setTimeout(() => {
            setIsWatchingAd(false);
            setLives(prev => Math.min(prev + 1, MAX_LIVES));
        }, 5000);
    };

    const handleRestart = () => {
        if (lives > 1) {
            setLives(lives - 1);
            setScore(0);
            setStreak(0);
            setQuestionCount(1);
            setGameOver(false);
            pickRandomPokemon(false);
        } else {
            setLives(0);
        }
    };


    if (!isUsernameSet) {
        return (
            <div style={{paddingTop: "120px"}}>
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
                               style={{position: "absolute", left: "20px", cursor: "pointer"}}/>
                    </Link>
                    <h1 className="header-title">ポケモンシルエットクイズ</h1>
                </header>
                <div className="quiz-container">
                    <p>プレイヤー名を入力してください</p>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ユーザーネーム"
                    />
                    <button onClick={handleUsernameSubmit}>スタート</button>
                </div>
            </div>
        );
    }

    if (gameOver) {
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
                    <h1>クイズ終了！</h1>
                    <p>{username} の最終スコア: {score}</p>
                    <h2>ランキング</h2>
                    <ul>
                        {ranking.map((entry, index) => (
                            <li key={index}>{index + 1}. {entry.name} - {entry.score}点</li>
                        ))}
                    </ul>
                    {lives > 1 ? (
                        <button onClick={handleRestart}>再挑戦（ライフ -1）</button>
                    ) : (
                        <button onClick={watchAdToRecoverLife}>広告を見て回復</button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{paddingTop: "120px"}}>
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
                           style={{position: "absolute", left: "20px", cursor: "pointer"}}/>
                </Link>
                <h1 className="header-title">ポケモンシルエットクイズ</h1>
            </header>

            <div className="quiz-container">
                <h1>答えろ</h1>
                <p>{username} のスコア: {score}（連続正解ボーナス: {streak}）</p>
                <p>ライフ: {lives} / {MAX_LIVES} ❤️</p>
                <p>問題: {questionCount} / {TOTAL_QUESTIONS}</p>
                <div className="silhouette-wrapper">
                    {currentPokemon && (
                        <img
                            src={currentPokemon.official_artwork}
                            alt="pokemon silhouette"
                            className={`silhouette ${showAnswer ? "reveal" : ""}`}
                            style={{ maxWidth: "300px" }}
                        />
                    )}
                </div>
                {showAnswer && currentPokemon && <p>正解: {currentPokemon.name.jpn}</p>}
                <input
                    type="text"
                    value={userInput}
                    onChange={handleChange}
                    placeholder="ポケモンの名前を入力"
                />
                {inputSuggestions.length > 0 && (
                    <ul className="suggestions">
                        {inputSuggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => {
                                    setUserInput(suggestion);
                                    setInputSuggestions([]); // ✨ クリックしたらリストを消す
                                }}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}

                <button onClick={checkAnswer}>答える</button>
                <button onClick={skipQuestion}>スキップ</button>
            </div>

            <MiniBreakout onClose={() => setShowBreakout(false)}/>
        </div>
    );
};

export default SilhouetteQuiz;
