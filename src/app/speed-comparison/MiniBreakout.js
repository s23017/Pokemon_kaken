"use client";

import React, { useRef, useEffect, useState } from "react";

const MiniBreakout = () => {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameInitialized, setGameInitialized] = useState(false); // ゲームが開始されたかどうかを管理
    const [bricks, setBricks] = useState([]);

    useEffect(() => {
        if (!isPlaying) return;

        setGameInitialized(true); // ゲーム開始フラグをセット

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const width = 240, height = 180;
        canvas.width = width;
        canvas.height = height;

        let ballRadius = 4, x = width / 2, y = height - 20, dx = 2, dy = -2;
        const paddleHeight = 6, paddleWidth = 50;
        let paddleX = (width - paddleWidth) / 2, rightPressed = false, leftPressed = false;

        const rowCount = 3, columnCount = 5, brickWidth = 30, brickHeight = 10, brickPadding = 5;
        let brickArray = [];
        for (let c = 0; c < columnCount; c++) {
            for (let r = 0; r < rowCount; r++) {
                brickArray.push({ x: c * (brickWidth + brickPadding) + 10, y: r * (brickHeight + brickPadding) + 10, status: 1 });
            }
        }
        setBricks(brickArray);

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

        function drawBricks() {
            for (let i = 0; i < brickArray.length; i++) {
                if (brickArray[i].status === 1) {
                    ctx.beginPath();
                    ctx.rect(brickArray[i].x, brickArray[i].y, brickWidth, brickHeight);
                    ctx.fillStyle = "#FF5733";
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }

        function collisionDetection() {
            for (let i = 0; i < brickArray.length; i++) {
                let b = brickArray[i];
                if (b.status === 1) {
                    if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                        dy = -dy;
                        b.status = 0;
                    }
                }
            }
            setBricks([...brickArray]);
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            drawBricks();
            drawBall();
            drawPaddle();
            collisionDetection();

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
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            border: "2px solid black",
            padding: "10px",
            zIndex: 1002,
            textAlign: "center",
            width: "260px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
            borderRadius: "10px"
        }}>
            <p>ミニゲームをプレイ！</p>
            <canvas ref={canvasRef}></canvas>
            {!gameInitialized && (
                <button onClick={() => setIsPlaying(true)}>
                    ゲーム開始
                </button>
            )}
        </div>
    );
};

export default MiniBreakout;
