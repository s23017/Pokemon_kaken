"use client";

import React, { useEffect, useRef, useState } from "react";

const MiniBreakout = () => {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // キャンバスサイズ
        const width = 200;
        const height = 150;
        canvas.width = width;
        canvas.height = height;

        // ボールの設定
        let ballRadius = 5;
        let x = width / 2;
        let y = height - 30;
        let dx = 2;
        let dy = -2;

        // パドルの設定
        const paddleHeight = 10;
        const paddleWidth = 50;
        let paddleX = (width - paddleWidth) / 2;
        let rightPressed = false;
        let leftPressed = false;

        // ブロックの設定
        const brickRowCount = 3;
        const brickColumnCount = 5;
        const brickWidth = 35;
        const brickHeight = 10;
        const brickPadding = 5;
        const brickOffsetTop = 20;
        const brickOffsetLeft = 10;
        let bricks = [];

        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }

        // キー操作イベント
        document.addEventListener("keydown", keyDownHandler);
        document.addEventListener("keyup", keyUpHandler);

        function keyDownHandler(e) {
            if (e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = true;
            } else if (e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = true;
            }
        }

        function keyUpHandler(e) {
            if (e.key === "Right" || e.key === "ArrowRight") {
                rightPressed = false;
            } else if (e.key === "Left" || e.key === "ArrowLeft") {
                leftPressed = false;
            }
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
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r].status === 1) {
                        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                        bricks[c][r].x = brickX;
                        bricks[c][r].y = brickY;
                        ctx.beginPath();
                        ctx.rect(brickX, brickY, brickWidth, brickHeight);
                        ctx.fillStyle = "#FF4500";
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        }

        function collisionDetection() {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    let b = bricks[c][r];
                    if (b.status === 1) {
                        if (
                            x > b.x &&
                            x < b.x + brickWidth &&
                            y > b.y &&
                            y < b.y + brickHeight
                        ) {
                            dy = -dy;
                            b.status = 0;
                        }
                    }
                }
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            drawBricks();
            drawBall();
            drawPaddle();
            collisionDetection();

            // ボールの壁反射
            if (x + dx > width - ballRadius || x + dx < ballRadius) {
                dx = -dx;
            }
            if (y + dy < ballRadius) {
                dy = -dy;
            } else if (y + dy > height - ballRadius) {
                if (x > paddleX && x < paddleX + paddleWidth) {
                    dy = -dy;
                } else {
                    setIsPlaying(false);
                    return;
                }
            }

            x += dx;
            y += dy;

            if (rightPressed && paddleX < width - paddleWidth) {
                paddleX += 3;
            } else if (leftPressed && paddleX > 0) {
                paddleX -= 3;
            }

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
            {!isPlaying && (
                <button onClick={() => setIsPlaying(true)}>ゲーム開始</button>
            )}
        </div>
    );
};

export default MiniBreakout;
