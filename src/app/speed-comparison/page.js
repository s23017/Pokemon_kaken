"use client";

import React, {useState, useEffect, useRef} from "react";
import pokemonData from "../party-builder/data/Pokemon.json";
import "./styles.css";
import Link from "next/link";
import Image from "next/image";

const TOTAL_QUESTIONS = 10;
const RANKING_LIMIT = 5;

const MiniBreakout = ({onClose}) => {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCloseButton, setShowCloseButton] = useState(false);

    useEffect(() => {
        if (isPlaying) {
            const timer = setTimeout(() => {
                setShowCloseButton(true);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [isPlaying]);

    useEffect(() => {
        if (!isPlaying) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const width = 200, height = 150;
        canvas.width = width;
        canvas.height = height;

        let ballRadius = 5, x = width / 2, y = height - 30, dx = 2, dy = -2;
        const paddleHeight = 10, paddleWidth = 50;
        let paddleX = (width - paddleWidth) / 2, rightPressed = false, leftPressed = false;

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

        draw();

        return () => {
            document.removeEventListener("keydown", keyDownHandler);
            document.removeEventListener("keyup", keyUpHandler);
        };
    }, [isPlaying]);

    return (
        <div style={{
            position: "fixed",
            bottom: "10px",
            left: "10px",
            background: "#fff",
            border: "2px solid black",
            padding: "5px",
            zIndex: 1000
        }}>
            {showCloseButton && (
                <button onClick={onClose} style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    background: "red",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px 6px",
                    fontSize: "14px",
                    borderRadius: "50%"
                }}>
                    ✖
                </button>
            )}
            <canvas ref={canvasRef}></canvas>
            {!isPlaying && <button onClick={() => setIsPlaying(true)}>ゲーム開始</button>}
        </div>
    );
};

const SilhouetteQuiz = () => {
    const [showBreakout, setShowBreakout] = useState(true);
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
    const [ranking, setRanking] = useState([]);

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
        }
        setTimeout(() => pickRandomPokemon(true), 2000);
    };

    const skipQuestion = () => {
        setShowAnswer(true);
        setStreak(0);
        setTimeout(() => pickRandomPokemon(true), 2000);
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
                    <Link href="/">
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
                    <Link href="/">
                        <Image src="/images/gaming.gif" width={50} height={50} alt="ホームに戻る"
                               style={{position: "absolute", left: "20px", cursor: "pointer"}}/>
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
                    <button onClick={() => window.location.reload()}>再挑戦</button>
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
                <Link href="/">
                    <Image src="/images/gaming.gif" width={50} height={50} alt="ホームに戻る"
                           style={{position: "absolute", left: "20px", cursor: "pointer"}}/>
                </Link>
                <h1 className="header-title">ポケモンシルエットクイズ</h1>
            </header>

            <div className="quiz-container">
                <h1>答えろ</h1>
                <p>{username} のスコア: {score}（連続正解ボーナス: {streak}）</p>
                <p>問題: {questionCount} / {TOTAL_QUESTIONS}</p>
                <div className="silhouette-wrapper">
                    {currentPokemon && (
                        <img
                            src={currentPokemon.official_artwork}
                            alt="pokemon silhouette"
                            className={`silhouette ${showAnswer ? "reveal" : ""}`}
                            style={{maxWidth: "300px"}}
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

            <MiniBreakout onClose={() => setShowBreakout(false)}/>
        </div>
    );
};

export default SilhouetteQuiz;
