"use client";

import React, { useState, useEffect } from "react";
import pokemonData from "../party-builder/data/Pokemon.json";
import "./styles.css"; // アニメーション用CSS
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
    const [inputSuggestions, setInputSuggestions] = useState([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [questionCount, setQuestionCount] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [ranking, setRanking] = useState([]);
    const [lives, setLives] = useState(MAX_LIVES);
    const [isWatchingAd, setIsWatchingAd] = useState(false);

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
        setInputSuggestions([]);
        if (incrementCount) setQuestionCount(prev => prev + 1);
    };

    const checkAnswer = () => {
        if (userInput === currentPokemon.name.jpn) {
            setShowAnswer(true);
            setScore(prev => prev + 10 + streak * 2);
            setStreak(prev => prev + 1);
        } else {
            setShowAnswer(true);
            setStreak(0);
            setLives(prev => prev - 1);
        }
        setTimeout(() => pickRandomPokemon(true), 3000); // 3秒後に次の問題へ
    };

    const skipQuestion = () => {
        setShowAnswer(true);
        setStreak(0);
        setTimeout(() => pickRandomPokemon(true), 3000);
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

    if (gameOver) {
        return (
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
                    <button onClick={() => setLives(lives - 1)}>再挑戦（ライフ -1）</button>
                ) : (
                    <button onClick={() => setIsWatchingAd(true)}>広告を見て回復</button>
                )}
                {isWatchingAd && <MiniBreakout onClose={() => setIsWatchingAd(false)} />}
            </div>
        );
    }

    return (
        <div className="quiz-container">
            <h1>ポケモンシルエットクイズ</h1>
            <p>{username} のスコア: {score}（連続正解ボーナス: {streak}）</p>
            <p>ライフ: {lives} / {MAX_LIVES} ❤️</p>
            <p>問題: {questionCount} / {TOTAL_QUESTIONS}</p>
            <div className="silhouette-wrapper">
                {currentPokemon && (
                    <div className={`silhouette-container ${showAnswer ? "reveal" : ""}`}>
                        <img
                            src={currentPokemon.official_artwork}
                            alt="pokemon silhouette"
                            className="pokemon-image"
                            style={{ maxWidth: "300px" }}
                        />
                    </div>
                )}
            </div>
            {showAnswer && currentPokemon && <p className="answer-text">正解: {currentPokemon.name.jpn}</p>}
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

            <MiniBreakout onClose={() => setShowBreakout(false)} />
        </div>
    );
};

export default SilhouetteQuiz;
