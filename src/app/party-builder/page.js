"use client";

import React, {useState} from "react";
import styles from "@/app/party-builder/styles/HomeStyles";
import Image from "next/image";
import Link from "next/link";
import {
    fetchAdvantageousPokemons,
    fetchMoveDetails,
    fetchPokemonAbilities,
    fetchPokemonDetails,
    filterByStats,
    findAdvantageousType
} from "../api/pokemon";
import typesEffectiveness from "./data/typeEffectiveness.json";
import pokemonData from "./data/Pokemon.json";
import itemsData from "./data/Pokemon_items.json";
import terastalData from "./data/Terastals.json"; // Terastals.jsonをインポート
import naturesData from "./data/Natures.json";
import abilitiesData from "./data/abilities.json";



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
            setShowMoveModal(true);// モーダルを表示


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
        if (party.length === 0) {
            alert("パーティーが空です。共有するポケモンを追加してください。");
            return;
        }

        // パーティーデータをシリアライズ
        const partyData = party.map((pokemon) => ({
            name: pokemon.name,
            types: pokemon.name.types,
            imageUrl: pokemon.official_artwork,
            selectedItem: pokemon.selectedItem?.name || null,
            selectedTerastal: pokemon.selectedTerastal?.type || null,
            selectedMoves: pokemon.selectedMoves || [],
            selectedNature: pokemon.selectedNature?.name || null,
            selectedAbility: pokemon.selectedAbility?.name || null,
            effortValues: pokemon.effortValues || {},
        }));

        // JSON文字列をエンコードしてクエリパラメータに設定
        const queryString = `party=${encodeURIComponent(JSON.stringify(partyData))}`;

        // URLの作成
        const shareUrl = `http://localhost:3000/sns/post?${queryString}`;

        // 共有先に遷移
        window.location.href = shareUrl;
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
    const [currentPage, setCurrentPage] = useState(0);
    const movesPerPage = 10;

    const handleNextPage = () => {
        if ((currentPage + 1) * movesPerPage < selectedPokemon.moves.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };
    const [selectedMoves, setSelectedMoves] = useState([]);

    const handleToggleMove = (move) => {
        setSelectedMoves((prev) => {
            if (prev.includes(move)) {
                // 技がすでに選択されている場合は削除
                return prev.filter((m) => m !== move);
            } else if (prev.length < 4) {
                // 技が4つ未満の場合は追加
                return [...prev, move];
            } else {
                alert("最大4つの技しか選択できません");
                return prev;
            }
        });
    };

    const handleConfirmMoves = () => {
        if (selectedMoves.length === 0) {
            alert("少なくとも1つの技を選択してください");
            return;
        }

        const updatedPokemon = {
            ...selectedPokemon,
            selectedMoves: selectedMoves,
        };

        setParty((prev) => [...prev, updatedPokemon]);
        handleCloseModal();
        setSelectedMoves([]); // 技の選択をリセット
    };
    const [selectedItem, setSelectedItem] = useState(null);

    const handleSelectItem = (item) => {
        setSelectedItem(item);
    };

    const handleConfirmSelection = () => {
        if (selectedMoves.length === 0 || !selectedItem || !selectedTerastal || !selectedNature || !selectedAbility) {
            alert("すべての項目を選択してください");
            return;
        }

        const updatedPokemon = {
            ...selectedPokemon,
            selectedMoves: selectedMoves,
            selectedItem: selectedItem,
            selectedTerastal: selectedTerastal,
            selectedNature: selectedNature,
            selectedAbility: selectedAbility,
            selectedPokemonType: selectedPokemonType,
            effortValues: effortValues,
        };

        setParty((prev) => [...prev, updatedPokemon]);
        handleCloseModal();
        setSelectedMoves([]);
        setSelectedItem(null);
        setSelectedTerastal(null);
        setSelectedNature(null);
        setSelectedAbility(null);
        setEffortValues({
            HP: 0,
            攻撃: 0,
            防御: 0,
            特攻: 0,
            特防: 0,
            素早さ: 0,
        });
    };

    const [currentItemPage, setCurrentItemPage] = useState(0);

    const handleNextItemPage = () => {
        if ((currentItemPage + 1) * itemsPerPage < itemsData.length) {
            setCurrentItemPage(currentItemPage + 1);
        }
    };

    const handlePrevItemPage = () => {
        if (currentItemPage > 0) {
            setCurrentItemPage(currentItemPage - 1);
        }
    };
    const [selectedTerastal, setSelectedTerastal] = useState(null); // 選択されたテラスタル
    const terastalImages = Array.from({ length: 18 }, (_, index) => `/images/terastals/${index + 1}.png`); // テラスタル画像リスト
    const terastalPerPage = 15; // 1ページあたりの表示数
    const itemsPerPage = 18; // 1ページあたりの持ち物の数
    const [currentTerastalPage, setCurrentTerastalPage] = useState(0); // 現在のページ

    const handleSelectTerastal = (image) => {
        setSelectedTerastal(image); // 選択された画像をセット
    };

    const handleNextTerastalPage = () => {
        if ((currentTerastalPage + 1) * terastalPerPage < terastalImages.length) {
            setCurrentTerastalPage(currentTerastalPage + 1);
        }
    };

    const handlePrevTerastalPage = () => {
        if (currentTerastalPage > 0) {
            setCurrentTerastalPage(currentTerastalPage - 1);
        }
    };
    const [selectedNature, setSelectedNature] = useState(null);
    const handleSelectNature = (nature) => {
        setSelectedNature(nature);
    };
    const [selectedAbility, setSelectedAbility] = useState(null);
    const [selectedPokemonType, setSelectedPokemonType] = useState(null);

    const handleSelectAbility = (ability) => {
        console.log(ability); //
        setSelectedAbility(ability);
    };
    const [effortValues, setEffortValues] = useState({
        HP: 0,
        攻撃: 0,
        防御: 0,
        特攻: 0,
        特防: 0,
        素早さ: 0,
    });

    const handleEffortValueChange = (stat, value) => {
        setEffortValues((prev) => ({
            ...prev,
            [stat]: Math.max(0, Math.min(value, 252)), // 努力値の範囲を制限
        }));
    };

    const [isPartyVisible, setIsPartyVisible] = useState(true); // パーティー欄の表示状態

    const togglePartyVisibility = () => {
        setIsPartyVisible((prev) => !prev);
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
                <span
                    style={{
                        ...styles.toggleIcon,
                        position: "fixed", // 画面に固定する
                        bottom: isPartyVisible ? "200px" : "100px", // パーティー欄の状態に応じて位置調整
                        right: "20px", // 画面右端からの距離
                        zIndex: 1100, // パーティー欄よりも前面に表示
                        cursor: "pointer",
                        fontSize: "24px", // 見やすいサイズ
                        backgroundColor: "white", // アイコンの背景を明確にする
                        padding: "5px", // 見た目を整える
                    }}
                    onClick={togglePartyVisibility}
                >
    {isPartyVisible ? "∧" : "∨"}
</span>
                <div style={styles.shareButtonContainer}>
                    <button style={styles.shareButton} onClick={handleShare}>
                        共有
                    </button>
                </div>
                {isPartyVisible && (
                    <div style={styles.partyGrid}>
                        {party.map((pokemon) => (
                            <div key={pokemon.name} style={styles.partyCard}>
                                <div style={styles.imageAndDetailsContainer}>
                                    {/* ポケモン画像 */}
                                    <img
                                        src={pokemon.official_artwork}
                                        alt={pokemon.name}
                                        style={styles.partyImage}
                                    />

                                    {/* 持ち物とテラスタル */}
                                    <div style={styles.itemAndTerastalContainer}>
                                        {pokemon.selectedItem && (
                                            <img
                                                src={`/images/items/${pokemon.selectedItem.image}`}
                                                alt={pokemon.selectedItem.name}
                                                style={styles.itemImage}
                                            />
                                        )}
                                        {pokemon.selectedTerastal && (
                                            <img
                                                src={pokemon.selectedTerastal.image}
                                                alt={`テラスタル ${pokemon.selectedTerastal.type}`}
                                                style={styles.terastalImage}
                                            />
                                        )}
                                    </div>
                                </div>
                                {/* 特性情報 */}
                                <div style={styles.abilityInfo}>
                                    <p style={{fontSize: "10px"}}>
                                        特性: {pokemon.selectedAbility?.name || "未選択"}
                                    </p>
                                </div>

                                {/* 性格情報 */}
                                <div style={styles.natureInfo}>
                                    <p style={{fontSize: "10px"}}>
                                        性格: {pokemon.selectedNature?.name || "未選択"}
                                    </p>
                                    {pokemon.selectedNature && (
                                        <p style={{fontSize: "10px"}}>
                                            ↑ {pokemon.selectedNature.boostedStat} / ↓{" "}
                                            {pokemon.selectedNature.loweredStat}
                                        </p>
                                    )}
                                </div>

                                {/* 努力値 */}
                                <div style={styles.effortValues}>
                                    <p style={{fontSize: "10px"}}>
                                        努力値:{" "}
                                        {Object.entries(pokemon.effortValues || {})
                                            .map(([stat, value]) => `${stat}: ${value}`)
                                            .join(", ")}
                                    </p>
                                </div>

                                {/* 技リスト */}
                                <div>
                                    <ul style={{listStyle: "none", padding: 0, margin: 0}}>
                                        {pokemon.selectedMoves.map((move, index) => (
                                            <li key={index} style={{fontSize: "10px"}}>
                                                {move}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* 削除ボタン */}
                                <button
                                    onClick={() => setParty((prev) => prev.filter((p) => p.name !== pokemon.name))}
                                    style={styles.button}
                                >
                                    削除
                                </button>
                            </div>
                        ))}
                    </div>
                )}


            </div>
            {showMoveModal && (
                <div style={styles.modalBackdrop}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>わざ・もちもの・テラスタルを選択してください</h2>

                        <div style={styles.modalContent}>
                            {/* 技リスト */}
                            <div style={styles.movesContainer}>
                                <h3 style={styles.modalSubtitle}>わざ</h3>
                                <div style={styles.scrollableMovesContainer}>
                                <ul style={styles.moveList}>
                                        {selectedPokemon.moves
                                            .slice(currentPage * movesPerPage, (currentPage + 1) * movesPerPage)
                                            .map((move, index) => (
                                                <li
                                                    key={index}
                                                    style={{
                                                        ...styles.moveItem,
                                                        backgroundColor: selectedMoves.includes(move.name)
                                                            ? "#4CAF50"
                                                            : "#f9f9f9",
                                                        color: selectedMoves.includes(move.name) ? "white" : "black",
                                                    }}
                                                    onClick={() => handleToggleMove(move.name)}
                                                >
                                                    <div style={styles.moveRow}>
                                                        <Image
                                                            src={`/images/types/${move.type}.png`}
                                                            alt={move.type}
                                                            width={24}
                                                            height={24}
                                                            style={styles.moveTypeImage}
                                                        />
                                                        <p style={styles.moveInfo}>
                                                            {move.name} | 威力: {move.power} | 命中率: {move.accuracy}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        {/* 空のリストアイテムを追加 */}
                                        {Array.from({length: movesPerPage - selectedPokemon.moves.slice(currentPage * movesPerPage, (currentPage + 1) * movesPerPage).length}).map((_, index) => (
                                            <li
                                                key={`empty-${index}`}
                                                style={{
                                                    ...styles.moveItem,
                                                    visibility: "hidden", // 空アイテムを見えなくする
                                                }}
                                            >
                                                空
                                            </li>
                                        ))}
                                    </ul>

                                    <div style={styles.paginationControls}>
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 0}
                                            style={styles.paginationButton}
                                        >
                                            {"<-"}
                                        </button>
                                        <span style={styles.paginationInfo}>
        {currentPage + 1}/{Math.ceil(selectedPokemon.moves.length / movesPerPage)}
    </span>
                                        <button
                                            onClick={handleNextPage}
                                            disabled={(currentPage + 1) * movesPerPage >= selectedPokemon.moves.length}
                                            style={styles.paginationButton}
                                        >
                                            {"->"}
                                        </button>
                                    </div>


                                </div>
                            </div>

                            {/* 持ち物リスト */}
                            <div style={styles.itemsContainer}>
                                <h3 style={styles.modalSubtitle}>もちもの</h3>
                                <ul style={styles.itemsList}>
                                    {itemsData
                                        .slice(currentItemPage * itemsPerPage, (currentItemPage + 1) * itemsPerPage)
                                        .map((item) => (
                                            <li
                                                key={item.id}
                                                style={{
                                                    ...styles.itemCard,
                                                    backgroundColor: selectedItem?.id === item.id ? "#4CAF50" : "#f9f9f9",
                                                }}
                                                onClick={() => handleSelectItem(item)}
                                            >
                                                <Image
                                                    src={`/images/items/${item.image}`}
                                                    alt={item.name}
                                                    width={48}
                                                    height={48}
                                                    style={styles.itemImage}
                                                />
                                                <p style={styles.itemName}>{item.name}</p>
                                            </li>
                                        ))}
                                </ul>
                                <div
                                    style={styles.paginationControls}>
                                    <button
                                        onClick={handlePrevItemPage}
                                        disabled={currentItemPage === 0}
                                        style={styles.paginationButton}
                                    >
                                        {"<-"}
                                    </button>
                                    <span style={styles.paginationInfo}>
        {currentItemPage + 1}/{Math.ceil(itemsData.length / itemsPerPage)}
    </span>
                                    <button
                                        onClick={handleNextItemPage}
                                        disabled={(currentItemPage + 1) * itemsPerPage >= itemsData.length}
                                        style={styles.paginationButton}
                                    >
                                        {"->"}
                                    </button>
                                </div>
                            </div>
                            <div style={styles.itemsContainer}>
                                <h3 style={styles.modalSubtitle}>テラスタル</h3>
                                <ul style={styles.itemsList}>
                                    {terastalData
                                        .slice(currentTerastalPage * terastalPerPage, (currentTerastalPage + 1) * terastalPerPage)
                                        .map((terastal) => (
                                            <li
                                                key={terastal.id}
                                                style={{
                                                    ...styles.itemCard,
                                                    backgroundColor: selectedTerastal?.id === terastal.id ? "#4CAF50" : "#f9f9f9",
                                                }}
                                                onClick={() => handleSelectTerastal(terastal)}
                                            >
                                                <Image
                                                    src={terastal.image}
                                                    alt={`テラスタル ${terastal.type}`}
                                                    width={48}
                                                    height={48}
                                                    style={styles.itemImage}
                                                />
                                                <p style={styles.itemName}>{terastal.type}</p>
                                            </li>
                                        ))}
                                </ul>
                                <div style={styles.paginationControls}>
                                    <button
                                        onClick={handlePrevTerastalPage}
                                        disabled={currentTerastalPage === 0}
                                        style={styles.paginationButton}
                                    >
                                        {"<-"}
                                    </button>
                                    <span style={styles.paginationInfo}>
                {currentTerastalPage + 1}/{Math.ceil(terastalData.length / terastalPerPage)}
            </span>
                                    <button
                                        onClick={handleNextTerastalPage}
                                        disabled={(currentTerastalPage + 1) * terastalPerPage >= terastalData.length}
                                        style={styles.paginationButton}
                                    >
                                        {"->"}
                                    </button>
                                </div>
                            </div>
                            <div style={styles.rowContainer}>
                                {/* 性格選択 */}
                                <div style={styles.selectionBox}>
                                    <h3 style={styles.selectionTitle}>性格</h3>
                                    <ul style={styles.selectionContent}>
                                        {naturesData.map((nature) => (
                                            <li
                                                key={nature.id}
                                                style={{
                                                    backgroundColor: selectedNature?.id === nature.id ? "#4CAF50" : "#f9f9f9",
                                                    padding: "5px",
                                                    marginBottom: "5px",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => handleSelectNature(nature)}
                                            >
                                                <p>{nature.name}</p>
                                                <p style={{fontSize: "10px"}}>
                                                    ↑ {nature.boostedStat} ↓ {nature.loweredStat}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* 特性選択 */}
                                <div style={styles.selectionBox}>
                                    <h3 style={styles.selectionTitle}>特性</h3>
                                    <ul style={styles.selectionContent}>
                                        {selectedPokemon?.abilities?.map((ability, index) => (
                                            <li
                                                key={index}
                                                style={{
                                                    backgroundColor: selectedAbility?.name === ability.name ? "#4CAF50" : "#f9f9f9",
                                                    padding: "5px",
                                                    marginBottom: "5px",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => handleSelectAbility(ability)}
                                            >
                                                <p>{ability.name}</p> {/* 特性名を日本語で表示 */}
                                                <p style={{fontSize: "10px"}}>
                                                    {abilitiesData.find(data => data.name.jpn === ability.name)?.effect || "説明が見つかりません"}
                                                </p> {/* 特性の説明を表示 */}

                                            </li>
                                        ))}
                                    </ul>

                                </div>

                                {/* 努力値 */}
                                <div style={styles.effortValuesContainer}>
                                    <h3 style={styles.modalSubtitle}>努力値</h3>
                                    {Object.keys(effortValues).map((stat) => (
                                        <div key={stat} style={styles.effortValueRow}>
                                            <label style={styles.effortValueLabel}>{stat}</label>
                                            <input
                                                type="number"
                                                value={effortValues[stat]}
                                                onChange={(e) => handleEffortValueChange(stat, parseInt(e.target.value))}
                                                style={styles.effortValueInput}
                                                max={252}
                                                min={0}
                                            />
                                        </div>
                                    ))}
                                </div>

                            </div>


                        </div>
                        {/* 現在選択中の情報を横並びで表示 */}
                        <div style={styles.selectedInfoContainer}>
                            <h3 style={styles.modalSubtitle}>現在の選択状況</h3>
                            <div style={styles.selectedInfoRow}>
                                <div style={styles.selectedColumn}>
                                    <p>選択中の技:</p>
                                    <ul>
                                        {selectedMoves.map((move, index) => (
                                            <li key={index} style={styles.selectedMove}>
                                                {move}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div style={styles.selectedColumn}>
                                    <p>選択中の持ち物:</p>
                                    <p>{selectedItem ? selectedItem.name : "未選択"}</p>
                                    <p>{selectedItem ? selectedItem.effect : ""}</p>
                                </div>
                                <div style={styles.selectedColumn}>
                                    <p>選択中のテラスタル:</p>
                                    <p>{selectedTerastal ? selectedTerastal.type : "未選択"}</p>
                                </div>
                                <div style={styles.selectedColumn}>
                                    <p>選択中の性格:</p>
                                    <p>{selectedNature ? selectedNature.name : "未選択"}</p>

                                </div>
                                <div style={styles.selectedColumn}>
                                    <p>選択中の特性:</p>
                                    <p>{selectedAbility ? selectedAbility.name : "未選択"}</p>
                                    <p>
                                        {selectedAbility
                                            ? abilitiesData.find(data => data.name.jpn === selectedAbility.name)?.effect || "効果がありません"
                                            : "効果がありません"}
                                    </p>
                                </div>


                                <div style={styles.selectedColumn}>
                                    <p>努力値:</p>
                                    <ul>
                                        {Object.entries(effortValues).map(([stat, value]) => (
                                            <p key={stat}>{stat}: {value}</p>
                                        ))}
                                    </ul>
                                </div>

                            </div>
                        </div>


                        <div style={styles.modalActions}>
                            <button style={styles.confirmButton} onClick={handleConfirmSelection}>
                                決定
                            </button>
                            <button style={styles.closeButton} onClick={() => setShowMoveModal(false)}>
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Home;
