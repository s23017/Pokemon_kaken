"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    fetchPokemonDetails,
    findAdvantageousType,
    fetchAdvantageousPokemons,
    filterByStats,
} from "../api/pokemon";
import typesEffectiveness from "./data/typeEffectiveness.json";
import pokemonData from "./data/Pokemon.json";

const getEnglishName = (japaneseName) => {
    const pokemon = pokemonData.find((p) => p.name.jpn === japaneseName);
    return pokemon ? pokemon.name.eng : null;
};

const getJapaneseName = (englishName) => {
    const pokemon = pokemonData.find((p) => p.name.eng.toLowerCase() === englishName.toLowerCase());
    return pokemon ? pokemon.name.jpn : null;
};

const getRandomElements = (array, num) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
};

const Home = () => {
    const [searchBars, setSearchBars] = useState([{ id: 1, pokemonName: "フシギダネ", result: [], suggestions: [] }]);
    const [loading, setLoading] = useState(false);
    const [party, setParty] = useState([]);

    const handleInputChange = (id, value) => {
        setSearchBars((prev) =>
            prev.map((bar) => {
                if (bar.id === id) {
                    const filteredSuggestions = value
                        ? pokemonData
                            .filter((pokemon) =>
                                pokemon.name.jpn.startsWith(value) ||
                                pokemon.name.eng.toLowerCase().startsWith(value.toLowerCase())
                            )
                            .map((pokemon) => pokemon.name.jpn)
                        : [];
                    return { ...bar, pokemonName: value, suggestions: filteredSuggestions };
                }
                return bar;
            })
        );
    };

    const handleSuggestionClick = (id, suggestion) => {
        setSearchBars((prev) =>
            prev.map((bar) =>
                bar.id === id ? { ...bar, pokemonName: suggestion, suggestions: [] } : bar
            )
        );
    };
    const handleRemoveSearchBar = (id) => {
        setSearchBars((prev) => prev.filter((bar) => bar.id !== id));
    };

    const handleAddSearchBarBelow = (id) => {
        setSearchBars((prev) => {
            const index = prev.findIndex((bar) => bar.id === id);
            const newBar = {id: prev.length + 1, pokemonName: "", result: [], suggestions: []};
            const newBars = [...prev];
            newBars.splice(index + 1, 0, newBar);
            return newBars;
        });
    };

    const handleSubmit = async (event, id, pokemonName) => {
        event.preventDefault();
        setLoading(true);
        try {
            const englishName = getEnglishName(pokemonName);
            if (!englishName) {
                alert("入力されたポケモン名が見つかりませんでした");
                setLoading(false);
                return;
            }
            const opponentDetails = await fetchPokemonDetails(englishName.toLowerCase());
            const opponentTypes = opponentDetails.types;

            const effectivenessMap = Object.keys(typesEffectiveness).map((type) => ({
                type,
                effectiveness: findAdvantageousType(opponentTypes, type),
            }));
            const maxEffectiveness = Math.max(...effectivenessMap.map((e) => e.effectiveness));
            const advantageousType = effectivenessMap.find((e) => e.effectiveness === maxEffectiveness);

            const advantageousPokemons = advantageousType
                ? await fetchAdvantageousPokemons(advantageousType.type)
                : [];
            const filteredResults = await filterByStats(advantageousPokemons);

            const randomPokemons = getRandomElements(filteredResults, 5).map((pokemon) => ({
                ...pokemon,
                name: getJapaneseName(pokemon.name) || pokemon.name,
                imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
            }));
            setSearchBars((prev) =>
                prev.map((bar) =>
                    bar.id === id ? { ...bar, result: randomPokemons } : bar
                )
            );
        } catch (error) {
            console.error("エラー:", error);
            alert("エラーが発生しました。再度お試しください。");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToParty = (pokemon) => {
        if (party.length >= 6) {
            alert("パーティーには最大6体のポケモンしか追加できません");
            return;
        }
        if (party.some((p) => p.name === pokemon.name)) {
            alert("このポケモンはすでにパーティーに存在します");
            return;
        }
        setParty((prev) => [...prev, pokemon]);
    };

    const handleRemoveFromParty = (pokemon) => {
        setParty((prev) => prev.filter((p) => p.name !== pokemon.name));
    };
    const handleShare = () => {
        const partyImages = party.map((pokemon) => pokemon.official_artwork);
        const queryString = partyImages.map((url, index) => `image${index + 1}=${encodeURIComponent(url)}`).join("&");
        // /sns にパーティーの画像をクエリとして渡す
        window.location.href = `http://localhost:3000/sns/post?${queryString}`;
    };


    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <Link href="/">
                        <Image
                            src="/images/gaming.gif"
                            width={50}
                            height={50}
                            alt="s.png"
                            style={{ cursor: "pointer" }}
                        />
                    </Link>
                </div>
                <h1 style={styles.headerTitle}>ポケモンパーティー構築</h1>
            </header>
            <div style={styles.mainContainer}>
                <h1 style={styles.title}>ポケモン検索</h1>
                <div style={styles.searchContainer}>
                    {searchBars.map((bar) => (
                        <div key={bar.id}>
                            {/* 入力されたポケモンの画像を表示 */}
                            <div style={{textAlign: "center", marginBottom: "10px"}}>
                                {bar.pokemonName && (() => {
                                    const pokemon = pokemonData.find(
                                        (p) =>
                                            p.name.jpn === bar.pokemonName ||
                                            p.name.eng.toLowerCase() === bar.pokemonName.toLowerCase()
                                    );
                                    return pokemon ? (
                                        <img
                                            src={pokemon.official_artwork}
                                            alt={bar.pokemonName}
                                            style={styles.pokemonImage}
                                        />
                                    ) : (
                                        <p>該当する画像が見つかりません</p>
                                    );
                                })()}
                            </div>
                            <form
                                onSubmit={(e) => handleSubmit(e, bar.id, bar.pokemonName)}
                                style={styles.searchBar}
                            >
                                <div style={{position: "relative", width: "100%"}}>
                                    <input
                                        type="text"
                                        value={bar.pokemonName}
                                        onChange={(e) => handleInputChange(bar.id, e.target.value)}
                                        placeholder="ポケモン名を入力"
                                        style={styles.input}
                                    />
                                    {bar.suggestions.length > 0 && (
                                        <ul style={styles.suggestionList}>
                                            {bar.suggestions.map((suggestion, index) => (
                                                <li
                                                    key={index}
                                                    style={styles.suggestionItem}
                                                    onClick={() => handleSuggestionClick(bar.id, suggestion)}
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <button type="submit" style={styles.button}>
                                    検索
                                </button>
                                {searchBars.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSearchBar(bar.id)}
                                        style={styles.removeButton}
                                    >
                                        削除
                                    </button>
                                )}
                            </form>
                            <div style={styles.resultsContainer}>
                                {bar.result.map((pokemon) => (
                                    <div key={pokemon.name} style={styles.pokemonCard}>
                                        <img
                                            src={pokemon.official_artwork}
                                            alt={pokemon.name}
                                            style={styles.pokemonImage}
                                        />
                                        <p style={styles.pokemonName}>{pokemon.name}</p>
                                        <button
                                            onClick={() => handleAddToParty(pokemon)}
                                            style={styles.button}
                                        >
                                            追加
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => handleAddSearchBarBelow(bar.id)}
                                style={styles.addBelowButton}
                            >
                                検索バーを追加
                            </button>
                        </div>

                    ))}
                </div>
                {loading && <p>検索中...</p>}
            </div>
            <div style={styles.partyContainer}>
                <h2 style={styles.partyTitle}>パーティー</h2>
                <div style={styles.shareButtonContainer}>
                    <button style={styles.shareButton} onClick={handleShare}>
                        共有
                    </button>
                </div>
                <div style={styles.partyGrid}>
                    {party.map((pokemon) => (
                        <div key={pokemon.name} style={styles.partyCard}>
                            <img
                                src={pokemon.official_artwork}
                                alt={pokemon.name}
                                style={styles.partyImage}
                            />
                            <p style={{fontSize: "12px", margin: "5px 0"}}>{pokemon.name}</p>
                            <button
                                onClick={() => handleRemoveFromParty(pokemon)}
                                style={styles.button}
                            >
                                削除
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const styles = {
    container: {
        marginTop: "80px", // ヘッダーの高さ分を空ける
        display: "flex",
        flexDirection: "column",
    },
    header: {
        backgroundColor: "#FF0000",
        color: "white",
        textAlign: "center",
        padding: "20px 0",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

    },
    headerLeft: {
        position: "absolute",
        left: "20px",
        top: "50%",
        transform: "translateY(-50%)",
    },
    headerTitle: {
        fontSize: "24px",
        margin: 0,
    },
    mainContainer: {
        flex: 3,
        textAlign: "center",
        marginBottom: "100px", // パーティー部分との間隔を調整
    },
    title: {
        marginBottom: "20px",
    },
    searchContainer: {
        marginBottom: "20px",
    },
    searchBar: {
        display: "flex", // 横並び
        flexDirection: "row", // 子要素を横方向に配置
        justifyContent: "center", // 横方向の中央揃え
        alignItems: "center", // 縦方向の中央揃え
        marginBottom: "20px", // 下部に余白
        gap: "10px", // 子要素間の余白
        width: "100%",
        maxWidth: "200px",
        margin: "0 auto",
        transform: "translateX(20px)",
        position: "relative",// 右
    },
    input: {
        flex: 1,
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    button: {
        padding: "8px", // ボタンサイズを調整
        borderRadius: "5px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontSize: "14px", // フォントサイズを縮小
        whiteSpace: "nowrap",
    },
    removeButton: {
        padding: "8px", // ボタンサイズを調整
        borderRadius: "5px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontSize: "14px", // フォントサイズを縮小
        whiteSpace: "nowrap",
    },
    resultsContainer: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "15px", // 間隔を調整
    },
    pokemonCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "10px",
        minWidth: "200px", // カード幅を縮小
        wordWrap: "break-word",
        textAlign: "center",
    },
    pokemonName: {
        fontSize: "14px",
        lineHeight: "1.5",
        margin: "10px 0",
    },
    partyContainer: {
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "white",
        borderTop: "1px solid #ccc",
        padding: "8px", // 全体の余白を縮小
        display: "flex",
        justifyContent: "center",
        zIndex: 1000,
    },
    partyGrid: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px", // 間隔を縮小
    },
    partyCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "8px", // カード内の余白を縮小
        width: "150px", // カード幅をさらに縮小
        textAlign: "center",
    },
    partyImage: {
        width: "60px", // 画像サイズを縮小
        height: "60px",
    },
    pokemonImage: {
        width: "250px",
        height: "250px",
    },
    suggestionList: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "5px",
        zIndex: 1000,
        listStyle: "none",
        padding: "0",
        margin: "0",
        maxHeight: "200px", // 最大表示高さを設定 (5体分程度)
        overflowY: "auto",
    },
    suggestionItem: {
        padding: "10px",
        cursor: "pointer",
        borderBottom: "1px solid #ccc",
    },
    partyTitle: {
        position: "fixed",
        left: "0",
        textAlign: "center",
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "10px",
        color: "#333",
    },
    shareButtonContainer: {
        position: "fixed", // 固定位置
        bottom: "20px",    // 画面下からの余白
        right: "20px",     // 画面右からの余白
        zIndex: 1000,      // 重なり順を上に
    },
    shareButton: {
        padding: "10px 20px",         // ボタン内の余白
        backgroundColor: "#4CAF50",  // ボタン色
        color: "white",              // 文字色
        border: "none",              // 境界線なし
        borderRadius: "5px",         // ボタンの角を丸く
        cursor: "pointer",           // ポインターカーソル
        fontSize: "16px",            // フォントサイズ
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // 影を追加
        transition: "transform 0.2s", // ホバーアニメーション
    },
    shareButtonHover: {
        transform: "scale(1.1)", // ホバー時にボタンを少し拡大
    },


};

export default Home;
