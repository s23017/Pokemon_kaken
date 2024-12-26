"use client"; // Next.jsでクライアントコンポーネントとして動作

import React, { useRef } from "react";
import { toPng } from "html-to-image";

const PokemonCard = () => {
    const cardContainerRef = useRef(null);

    const partyData = [
        {
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
            性格: "ようき",
            持ち物: "きあいのタスキ",
            特性: "かたやぶり",
            努力値: "HP: 0 / 攻撃: 252 / 素早さ: 252",
            技: ["アイアンヘッド", "じしん", "つるぎのまい", "がんせきふうじ"],
        },
        // 他のポケモンデータを追加
        {
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
            性格: "いじっぱり",
            持ち物: "こだわりスカーフ",
            特性: "いかく",
            努力値: "HP: 4 / 攻撃: 252 / 素早さ: 252",
            技: ["ストーンエッジ", "しんそく", "じしん", "おんがえし"],
        },
        {
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
            性格: "ひかえめ",
            持ち物: "たべのこし",
            特性: "てんねん",
            努力値: "HP: 252 / 防御: 252 / 特攻: 4",
            技: ["ムーンフォース", "めいそう", "どくどく", "みがわり"],
        },
        {
            image:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
            性格: "のんき",
            持ち物: "オボンのみ",
            特性: "しんりょく",
            努力値: "HP: 252 / 防御: 252 / 特防: 4",
            技: ["リーフストーム", "やどりぎのタネ", "なやみのタネ", "まもる"],
        },
        {
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
            性格: "おくびょう",
            持ち物: "きあいのタスキ",
            特性: "ふゆう",
            努力値: "HP: 4 / 特攻: 252 / 素早さ: 252",
            技: ["サイコキネシス", "シャドーボール", "エナジーボール", "かえんほうしゃ"],
        },
        {
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
            性格: "わんぱく",
            持ち物: "ゴツゴツメット",
            特性: "いかく",
            努力値: "HP: 252 / 防御: 252 / 特防: 4",
            技: ["じしん", "ドラゴンクロー", "ステルスロック", "まもる"],
        },
    ];

    const handleSaveImage = () => {
        if (cardContainerRef.current === null) {
            return;
        }

        toPng(cardContainerRef.current, {
            cacheBust: true,
            backgroundColor: "white", // 背景色を白に設定
            width: cardContainerRef.current.offsetWidth, // コンテンツの幅に合わせる
            height: cardContainerRef.current.offsetHeight, // コンテンツの高さに合わせる
        })
            .then((dataUrl) => {
                const link = document.createElement("a");
                link.download = "pokemon-cards.png";
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error("画像の保存に失敗しました: ", err);
            });
    };


    return (
        <div>
            {/* 保存ボタン */}
            <button onClick={handleSaveImage} style={styles.saveButton}>
                画像を保存
            </button>

            {/* カード全体をラップ */}
            <div ref={cardContainerRef} style={styles.gridContainer}>
                {partyData.map((pokemonData, index) => (
                    <div key={index} style={styles.container}>
                        <div style={styles.imageContainer}>
                            <div style={styles.imageBox}>
                                <img
                                    src={pokemonData.image}
                                    alt="ポケモンの画像"
                                    style={styles.image}
                                />
                            </div>
                        </div>
                        <div style={styles.infoContainer}>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>性格</span>
                                <span style={styles.value}>{pokemonData.性格}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>持ち物</span>
                                <span style={styles.value}>{pokemonData.持ち物}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>特性</span>
                                <span style={styles.value}>{pokemonData.特性}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.label}>努力値</span>
                                <span style={styles.value}>{pokemonData.努力値}</span>
                            </div>
                            {pokemonData.技.map((move, moveIndex) => (
                                <div style={styles.infoRow} key={moveIndex}>
                                    <span style={styles.label}>わざ {moveIndex + 1}</span>
                                    <span style={styles.value}>{move}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    saveButton: {
        margin: "20px auto",
        padding: "10px 20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",

        borderRadius: "5px",
        cursor: "pointer",
        display: "block",
    },
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "0px", // 余白を完全になくす
        padding: "0", // コンテナの内側余白をなくす
        margin: "0", // 外側余白をなくす
        width: "fit-content", // コンテンツの幅に合わせる
        height: "fit-content", // コンテンツの高さに合わせる
    },
    container: {
        margin: "0", // カードの外側余白を削除
        padding: "10px", // 適切な内側余白を設定
        border: "1px solid #ccc",
        backgroundColor: "#f9f9f9",
    },
    imageContainer: {
        flex: "1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    imageBox: {
        width: "100px", // 幅を固定
        height: "100px", // 高さを固定
        backgroundColor: "#ddd",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "10px",
        margin: "0", // マージンを削除
    },
    image: {
        maxWidth: "100%",
        maxHeight: "100%",
        borderRadius: "10px",
    },
    infoContainer: {
        flex: "2",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2px",
    },
    infoRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#eee",
        padding: "2px", // パディングを小さくする
        margin: "0",   // マージンを削除
        borderRadius: "3px", // 少しだけ丸みを残す
        fontSize: "12px", // フォントサイズを調整
    },
    label: {
        fontWeight: "bold",
        color: "#333",
    },
    value: {
        color: "#555",
    },
};

export default PokemonCard;
