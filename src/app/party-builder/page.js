"use client";

import React, { useState } from "react";
import styles from "@/app/party-builder/styles/HomeStyles";
import Image from "next/image";
import Link from "next/link";
import {
    fetchPokemonDetails,
    findAdvantageousType,
    fetchAdvantageousPokemons,
    filterByStats, fetchMoveDetails,
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
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [showMoveModal, setShowMoveModal] = useState(false);

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
                moves: pokemon.moves || [],
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

    const handleAddToParty = async (pokemon) => {
        console.log("[INFO] 選択されたポケモン:", pokemon);
        try {
            // 技名を日本語に変換
            const movesInJapanese = await Promise.all(
                pokemon.moves.map(async (move) => {
                    const japaneseMove = await fetchMoveDetails(move); // 技名を日本語に変換
                    return japaneseMove || move; // 日本語名が取得できない場合は元の英語名を使用
                })
            );
            setSelectedPokemon({ ...pokemon, moves: movesInJapanese });
            setShowMoveModal(true); // モーダルを表示
        } catch (error) {
            console.error("技名取得エラー:", error);
            alert("技名を取得できませんでした。");
        }
    };

    const handleCloseModal = () => {
        setShowMoveModal(false);
        setSelectedPokemon(null);
    };
    const handleShare = () => {
        const partyImages = party.map((pokemon) => pokemon.official_artwork);
        const queryString = partyImages.map((url, index) => `image${index + 1}=${encodeURIComponent(url)}`).join("&");
        // /sns にパーティーの画像をクエリとして渡す
        window.location.href = `http://localhost:3000/sns/post?${queryString}`;
    };


    const handleConfirmMove = async (move) => {
        if (party.length >= 6) {
            alert("パーティーには最大6体のポケモンしか追加できません");
            return;
        }
        if (party.some((p) => p.name === selectedPokemon.name)) {
            alert("このポケモンはすでにパーティーに存在します");
            return;
        }

        try {
            const japaneseMove = await fetchMoveDetails(move); // 技名を日本語に変換
            const updatedPokemon = { ...selectedPokemon, selectedMove: japaneseMove };
            setParty((prev) => [...prev, updatedPokemon]);
            handleCloseModal();
        } catch (error) {
            console.error("技名変換エラー:", error);
            alert("技名を選択できませんでした。再試行してください。");
        }
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
                            <p style={{fontSize: "12px", margin: "5px 0"}}>技: {pokemon.selectedMove}</p>
                            <button
                                onClick={() => setParty((prev) => prev.filter((p) => p.name !== pokemon.name))}
                                style={styles.button}
                            >
                                削除
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            {showMoveModal && (
                <div style={styles.modalBackdrop}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>技を選択してください</h2>
                        {selectedPokemon?.moves?.length > 0 ? (
                            <div style={styles.scrollableMovesContainer}>
                                <ul style={styles.moveList}>
                                    {selectedPokemon.moves.map((move, index) => (
                                        <li key={index} style={styles.moveItem}>
                                            <button
                                                style={styles.moveButton}
                                                onClick={() => handleConfirmMove(move)}
                                            >
                                                {move}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p>利用可能な技がありません</p>
                        )}
                        <button style={styles.closeButton} onClick={handleCloseModal}>
                            閉じる
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;
