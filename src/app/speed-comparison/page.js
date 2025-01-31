"use client";

import React, { useState, useEffect, useRef } from "react";
import pokemonData from "../party-builder/data/Pokemon.json";
import "./styles.css";
import Link from "next/link";
import Image from "next/image";

const TOTAL_QUESTIONS = 10;
const RANKING_LIMIT = 10; // ランキングに表示する上位スコアの数

const MiniBreakout = () => {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const width = 200;
        const height = 150;
        canvas.width = width;
        canvas.height = height;

        let ballRadius = 5;
        let x = width / 2;
        let y = height - 30;
        let dx = 2;
        let dy = -2;

        const paddleHeight = 10;
        const paddleWidth = 50;
        let paddleX = (width - paddleWidth) / 2;
        let rightPressed = false;
        let leftPressed = false;

        document.addEventListener("keydown", keyDownHandler);
        document.addEventListener("keyup", keyUpHandler);

        function keyDownHandler(e) {
            if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
            else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
        }

        function keyUpHandler(e) {
            if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
            else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
        }

        function drawBall() {
            ctx.beginPath();
            ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }

        function drawPaddle() {
            ctx.beginPath();
            ctx.rect(paddleX, height - paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            drawBall();
            drawPaddle();

            if (x + dx > width - ballRadius || x + dx < ballRadius) dx = -dx;
            if (y + dy < ballRadius) dy = -dy;
            else if (y + dy > height - ballRadius) {
                if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
                else {
                    setIsPlaying(false);
                    return;
                }
            }

            x += dx;
            y += dy;

            if (rightPressed && paddleX < width - paddleWidth) paddleX += 3;
            else if (leftPressed && paddleX > 0) paddleX -= 3;

            requestAnimationFrame(draw);
        }

        if (isPlaying) draw();

        return () => {
            document.removeEventListener("keydown", keyDownHandler);
            document.removeEventListener("keyup", keyUpHandler);
        };
    }, [isPlaying]);

    return (
        <div
            style={{
                position: "fixed",
                bottom: "10px",
                left: "10px",
                background: "#fff",
                border: "2px solid black",
                padding: "5px",
                zIndex: 1000,
            }}
        >
            <canvas ref={canvasRef}></canvas>
            {!isPlaying && <button onClick={() => setIsPlaying(true)}>ゲーム開始</button>}
        </div>
    );
};

const SilhouetteQuiz = () => {
    const [username, setUsername] = useState("");
    const [isUsernameSet, setIsUsernameSet] = useState(false);
    const [currentPokemon, setCurrentPokemon] = useState(null);
    const [userInput, setUserInput] = useState("");
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [inputSuggestions, setInputSuggestions] = useState([]);
    const [questionCount, setQuestionCount] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [ranking, setRanking] = useState([]);

    useEffect(() => {
        if (isUsernameSet) pickRandomPokemon(false);
        loadRanking();
    }, [isUsernameSet]);

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
        setImageLoaded(false);
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
        }
        setTimeout(() => pickRandomPokemon(true), 2000);
    };

    const loadRanking = () => {
        const storedRanking = JSON.parse(localStorage.getItem("pokemon_quiz_ranking")) || [];
        setRanking(storedRanking);
    };

    const updateRanking = () => {
        const newRanking = [...ranking, { name: username, score }]
            .sort((a, b) => b.score - a.score)
            .slice(0, RANKING_LIMIT);
        setRanking(newRanking);
        localStorage.setItem("pokemon_quiz_ranking", JSON.stringify(newRanking));
    };

    if (!isUsernameSet) {
        return (
            <div className="quiz-container">
                <h1>ポケモンシルエットクイズ</h1>
                <p>プレイヤー名を入力してください</p>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ユーザーネーム"
                />
                <button onClick={() => setIsUsernameSet(true)}>スタート</button>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: "120px" }}>
            <header style={{ backgroundColor: "#FF0000", color: "white", textAlign: "center", padding: "20px 0", position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}>
                <Link href="/">
                    <Image src="/images/gaming.gif" width={50} height={50} alt="ホームに戻る" style={{ position: "absolute", left: "20px", cursor: "pointer" }} />
                </Link>
                <h1 className="header-title">ポケモンシルエットクイズ</h1>
            </header>
            <div className="quiz-container">
                <h1>ポケモンシルエットクイズ</h1>
                <p>{username} のスコア: {score}（連続正解ボーナス: {streak}）</p>
                <div className="silhouette-wrapper">
                    {currentPokemon && <img src={currentPokemon.official_artwork} alt="pokemon silhouette" className={`silhouette ${showAnswer ? "reveal" : ""}`} onLoad={() => setImageLoaded(true)} style={{ visibility: imageLoaded ? "visible" : "hidden" }} />}
                </div>
                <button onClick={checkAnswer}>答える</button>
            </div>

            <MiniBreakout />
        </div>
    );
};

export default SilhouetteQuiz;
