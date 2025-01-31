"use client";

import React, { useState, useEffect } from "react";
import pokemonData from "../party-builder/data/Pokemon.json";
import "./styles.css";

const TOTAL_QUESTIONS = 10; // 出題する問題数

const SilhouetteQuiz = () => {
    const [currentPokemon, setCurrentPokemon] = useState(null);
    const [userInput, setUserInput] = useState("");
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [inputSuggestions, setInputSuggestions] = useState([]);
    const [questionCount, setQuestionCount] = useState(1); // 初期値を1に設定
    const [gameOver, setGameOver] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        pickRandomPokemon(false); // 初回呼び出し時はカウントを増やさない
    }, []);

    const pickRandomPokemon = (incrementCount = true) => {
        if (questionCount > TOTAL_QUESTIONS) {
            setGameOver(true);
            return;
        }
        const randomIndex = Math.floor(Math.random() * pokemonData.length);
        setCurrentPokemon(pokemonData[randomIndex]);
        setShowAnswer(false); // シルエットに戻す
        setUserInput("");
        setImageLoaded(false); // 画像のロード状態をリセット
        if (incrementCount) {
            setQuestionCount(prev => prev + 1); // 初回以外の時のみカウントを増やす
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setUserInput(value);
        if (value.length > 0) {
            const suggestions = pokemonData
                .filter(p => p.name.jpn.startsWith(value))
                .map(p => p.name.jpn);
            setInputSuggestions(suggestions.slice(0, 5));
        } else {
            setInputSuggestions([]);
        }
    };

    const checkAnswer = () => {
        if (userInput === currentPokemon.name.jpn) {
            setShowAnswer(true);
            setScore(prev => prev + 10 + streak * 2);
            setStreak(prev => prev + 1);
        } else {
            setShowAnswer(true); // 不正解でも正解を表示
            setStreak(0);
        }
        setTimeout(() => pickRandomPokemon(true), 2000); // 2秒後に次の問題
    };

    const skipQuestion = () => {
        setShowAnswer(true); // 正解を表示
        setStreak(0);
        setTimeout(() => pickRandomPokemon(true), 2000);
    };

    if (gameOver) {
        return (
            <div className="quiz-container">
                <h1>クイズ終了！</h1>
                <p>最終スコア: {score}</p>
                <button onClick={() => window.location.reload()}>再挑戦</button>
            </div>
        );
    }

    return (
        <div className="quiz-container">
            <h1>ポケモンシルエットクイズ</h1>
            <p>スコア: {score}（連続正解ボーナス: {streak}）</p>
            <p>問題: {questionCount} / {TOTAL_QUESTIONS}</p>
            <div className="silhouette-wrapper">
                {currentPokemon && (
                    <img
                        src={currentPokemon.official_artwork}
                        alt="pokemon silhouette"
                        className={`silhouette ${showAnswer ? "reveal" : ""}`}
                        onLoad={() => setImageLoaded(true)}
                        style={{ visibility: imageLoaded ? "visible" : "hidden" }}
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
                        <li key={index} onClick={() => setUserInput(suggestion)}>
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={checkAnswer}>答える</button>
            <button onClick={skipQuestion}>スキップ</button>
        </div>
    );
};

export default SilhouetteQuiz;
