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
            タイプ: ["はがね", "じめん"], // 追加
        },
        // 他のポケモンデータ
        {
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
            性格: "ひかえめ",
            持ち物: "たべのこし",
            特性: "てんねん",
            努力値: "HP: 252 / 防御: 252 / 特攻: 4",
            技: ["ムーンフォース", "めいそう", "どくどく", "みがわり"],
            タイプ: ["フェアリー"], // 追加
        },
    ];

    const handleSaveImage = () => {
        if (cardContainerRef.current === null) {
            return;
        }

        toPng(cardContainerRef.current, {
            cacheBust: true,
            backgroundColor: "white",
            width: cardContainerRef.current.offsetWidth,
            height: cardContainerRef.current.offsetHeight,
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

    const getTypeColor = (types) => {
        const typeColors = {
            はがね: "#A8A8C0",
            フェアリー: "#F4BDC9",
            じめん: "#E0C068",
            でんき: "#FAE078",
            みず: "#6890F0",
            ほのお: "#F08030",
            // 他のタイプを追加
        };
        return types.map((type) => typeColors[type] || "#D3D3D3").join(", ");
    };

    return (
        <div>
            <button onClick={handleSaveImage} style={styles.saveButton}>
                画像を保存
            </button>

            <div ref={cardContainerRef} style={styles.gridContainer}>
                {partyData.map((pokemonData, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.container,
                            backgroundColor: getTypeColor(pokemonData.タイプ), // 背景色をタイプに応じて変更
                        }}
                    >
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
        gap: "0px",
        padding: "0",
        margin: "0",
        width: "fit-content",
        height: "fit-content",
    },
    container: {
        margin: "0",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        backgroundColor: "#f9f9f9",
    },
    imageContainer: {
        flex: "1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    imageBox: {
        width: "100px",
        height: "100px",
        backgroundColor: "#ddd",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "10px",
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
        padding: "2px",
        margin: "0",
        borderRadius: "3px",
        fontSize: "12px",
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
