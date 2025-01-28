"use client";

import React, { useState } from "react";
import pokemonData from "../party-builder/data/Pokemon.json";
import typesEffectiveness from "../party-builder/data/typeEffectiveness.json";
import "./styles.css";
import Link from "next/link";
import Image from "next/image";

// ポケモンの詳細を取得する関数
// ポケモンの詳細を取得する関数
export const fetchPokemonDetails = async (pokemonName) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch Pokemon details: ${response.statusText}`);
        }
        const data = await response.json();

        console.log("APIデータ:", data); // デバッグ用

        const statMapping = {
            hp: "hp",
            attack: "atk",
            defense: "def",
            "special-attack": "spa",
            "special-defense": "spd",
            speed: "spe",
        };

        const stats = data.stats.map((stat) => ({
            base_stat: stat.base_stat,
            name: statMapping[stat.stat.name] || stat.stat.name,
        }));

        const moves = await Promise.all(
            data.moves.map(async (move) => {
                const moveDetails = await fetch(move.move.url).then((res) => res.json());
                return {
                    name: moveDetails.names.find((name) => name.language.name === "ja")?.name || moveDetails.name,
                    power: moveDetails.power || "不明",
                    type: moveDetails.type.name,
                    category: moveDetails.damage_class.name, // 技の分類
                };
            })
        );

        return {
            name: data.name,
            stats,
            sprite: data.sprites.front_default,
            official_artwork: data.sprites.other["official-artwork"].front_default,
            moves,
        };
    } catch (error) {
        console.error(`Error fetching details for ${pokemonName}:`, error);
        return null;
    }
};
export const calculateTotalStats = (stats) => {
    return stats.reduce((total, stat) => total + stat.base_stat, 0);
};
const displayPokemonDetails = async () => {
    const details = await fetchPokemonDetails("pikachu");
    console.log(details);
};

displayPokemonDetails();

const typeTranslations = {
    normal: "ノーマル",
    fire: "ほのお",
    water: "みず",
    grass: "くさ",
    electric: "でんき",
    ice: "こおり",
    fighting: "かくとう",
    poison: "どく",
    ground: "じめん",
    flying: "ひこう",
    psychic: "エスパー",
    bug: "むし",
    rock: "いわ",
    ghost: "ゴースト",
    dragon: "ドラゴン",
    dark: "あく",
    steel: "はがね",
    fairy: "フェアリー",
};
// タイプを日本語に変換する関数
const getTranslatedType = (type) => {
    return typeTranslations[type] || "不明";
};

// JSX部分
const MoveDetails = ({ attacker }) => {
    return (
        <div>
            <p>タイプ: {getTranslatedType(attacker.selectedMove.type)}</p>
        </div>
    );
};













const DamageCalculatorPage = () => {
    const [attacker, setAttacker] = useState({
        name: "",
        image: "",
        moves: [],
        selectedMove: null,
        baseStats: {},
        iv: { atk: 31, spa: 31 },
        ev: { atk: 0, spa: 0 },
        level: 50,
    });

    const [defender, setDefender] = useState({
        name: "",
        image: "",
        baseStats: {},
        iv: { hp: 31, def: 31, spd: 31 },
        ev: { hp: 0, def: 0, spd: 0 },
        level: 50,
    });

    const [attackerSearchQuery, setAttackerSearchQuery] = useState("");
    const [attackerSearchResults, setAttackerSearchResults] = useState([]);
    const [defenderSearchQuery, setDefenderSearchQuery] = useState("");
    const [defenderSearchResults, setDefenderSearchResults] = useState([]);
    const [damageResult, setDamageResult] = useState(null);
    const [showMoveModal, setShowMoveModal] = useState(false);

    const statLabels = {
        atk: "攻撃",
        spa: "特攻",
        hp: "HP",
        def: "防御",
        spd: "特防",
        spe: "素早さ"
    };

    const calculateStat = (base, iv, ev, level) => {
        return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100 + 5);
    };

    const calculateHP = (base, iv, ev, level) => {
        return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100 + level + 10);
    };

    const handleSearchChange = (query, role) => {
        const results = pokemonData.filter(
            (pokemon) =>
                pokemon.name.jpn.includes(query) ||
                pokemon.name.eng.toLowerCase().includes(query.toLowerCase())
        );

        if (role === "attacker") {
            setAttackerSearchQuery(query);
            setAttackerSearchResults(results);
        } else {
            setDefenderSearchQuery(query);
            setDefenderSearchResults(results);
        }
    };

    const handleSelectPokemon = async (role, pokemon) => {
        const details = await fetchPokemonDetails(pokemon.name.eng.toLowerCase());
        if (!details) {
            alert("ポケモンの詳細を取得できませんでした。");
            return;
        }

        console.log("ポケモン詳細データ:", details); // デバッグ用

        const baseStats = details.stats.reduce((acc, stat) => {
            acc[stat.name] = stat.base_stat;
            return acc;
        }, {});

        if (role === "attacker") {
            setAttacker({
                ...attacker,
                name: details.name,
                image: details.official_artwork,
                moves: details.moves,
                baseStats,
                level: 50,
            });
        } else {
            setDefender({
                ...defender,
                name: details.name,
                image: details.official_artwork,
                baseStats,
                level: 50,
            });
        }
    };

    const handleInputChange = (role, type, stat, value) => {
        const updatedValue = Math.max(
            0,
            Math.min(type === "ev" ? 252 : 31, parseInt(value, 10) || 0)
        );

        if (role === "attacker") {
            setAttacker({
                ...attacker,
                [type]: {
                    ...attacker[type],
                    [stat]: updatedValue,
                },
            });
        } else {
            setDefender({
                ...defender,
                [type]: {
                    ...defender[type],
                    [stat]: updatedValue,
                },
            });
        }
    };

    const handleOpenMoveModal = () => {
        if (!attacker.moves || attacker.moves.length === 0) {
            alert("技が見つかりません。ポケモンを選択してください。");
            return;
        }
        setShowMoveModal(true);
    };

    const handleMoveSelection = (move) => {
        setAttacker({ ...attacker, selectedMove: move });
        setShowMoveModal(false);
    };

    const calculateDamage = () => {
        if (!attacker.selectedMove) {
            alert("技を選択してください！");
            return;
        }

        const move = attacker.selectedMove;
        const level = attacker.level;

        const power = move.power || 0;

        if (power === 0) {
            alert("選択された技に威力が設定されていません。");
            return;
        }

        // 技の物理/特殊判定
        const isPhysical = move.category === "physical";

        // 攻撃側の実数値
        const attackStat = isPhysical
            ? calculateStat(attacker.baseStats.atk, attacker.iv.atk, attacker.ev.atk, level)
            : calculateStat(attacker.baseStats.spa, attacker.iv.spa, attacker.ev.spa, level);

        // 防御側の実数値
        const defenseStat = isPhysical
            ? calculateStat(defender.baseStats.def, defender.iv.def, defender.ev.def, defender.level)
            : calculateStat(defender.baseStats.spd, defender.iv.spd, defender.ev.spd, defender.level);

        const hp = calculateHP(defender.baseStats.hp, defender.iv.hp, defender.ev.hp, defender.level);

        // STAB (Same Type Attack Bonus)
        const stab = attacker.stab ? 1.5 : 1.0;

        // タイプ相性
        const typeEffectiveness = (typesEffectiveness[move.type] || {})[defender.name] || 1.0;

        // ランダム係数 (85%～100%)
        const randomFactorMin = 0.85; // 最小値
        const randomFactorMax = 1.0;  // 最大値

        // 基本ダメージ計算式
        const baseDamage = Math.floor(
            ((((2 * level) / 5 + 2) * power * attackStat) / defenseStat) / 50 + 2
        );

        // 最小ダメージ
        const minDamage = Math.floor(
            baseDamage * stab * typeEffectiveness * randomFactorMin
        );

        // 最大ダメージ
        const maxDamage = Math.floor(
            baseDamage * stab * typeEffectiveness * randomFactorMax
        );

        // 結果を設定
        setDamageResult({
            minDamage,
            maxDamage,
            hitsRequiredMin: Math.ceil(hp / maxDamage),
            hitsRequiredMax: Math.ceil(hp / minDamage),
        });
    };

    const handleStabToggle = () => {
        setAttacker((prev) => ({ ...prev, stab: !prev.stab }));
    };

    return (
        <div>
            <header
                style={{
                    backgroundColor: "#FF0000",
                    color: "white",
                    textAlign: "center",
                    padding: "10px 0",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "75px", // ヘッダーの高さを指定
                    zIndex: 1000,
                }}
            >
                <Link href="/">
                    <Image
                        src="/images/gaming.gif"
                        width={50}
                        height={50}
                        alt="ホームに戻る"
                        style={{position: "absolute", left: "20px", cursor: "pointer"}}
                    />
                </Link>
                <h1>ダメージ計算ツール</h1>
            </header>
            <div
                style={{
                    paddingTop: "80px", // ヘッダーの高さ分の余白を追加
                }}
            >
                <div className="container">
                    <div className="pokemon-section">
                        <h2>攻撃側</h2>
                        <input
                            type="text"
                            placeholder="ポケモン名を入力"
                            value={attackerSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value, "attacker")}
                            className="input-field"
                        />
                        {attackerSearchResults.length > 0 && (
                            <ul className="search-results compact">
                                {attackerSearchResults.map((pokemon) => (
                                    <li
                                        key={pokemon.id}
                                        onClick={() => handleSelectPokemon("attacker", pokemon)}
                                    >
                                        {pokemon.name.jpn} ({pokemon.name.eng})
                                    </li>
                                ))}
                            </ul>
                        )}
                        {attacker.image && (
                            <img
                                src={attacker.image}
                                alt={attacker.name}
                                className="pokemon-image"
                            />
                        )}
                        <button onClick={handleOpenMoveModal} className="button">
                            技を選択
                        </button>
                        {attacker.selectedMove && (
                            <div>
                                <h3>選択された技:</h3>
                                <p>名前: {attacker.selectedMove.name}</p>
                                <p>威力: {attacker.selectedMove.power}</p>
                                <p>タイプ: {getTranslatedType(attacker.selectedMove.type)}</p>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={attacker.stab}
                                        onChange={handleStabToggle}
                                    />
                                    タイプ一致
                                </label>
                            </div>
                        )}
                        <div className="stat-section">
                            <h3>種族値</h3>
                            <p>
                                HP: {attacker.baseStats.hp || "不明"} <br/>
                                攻撃: {attacker.baseStats.atk || "不明"} <br/>
                                防御: {attacker.baseStats.def || "不明"} <br/>
                                特攻: {attacker.baseStats.spa || "不明"} <br/>
                                特防: {attacker.baseStats.spd || "不明"} <br/>
                                素早さ: {attacker.baseStats.spe || "不明"}
                            </p>

                            <h3>努力値 (EV)</h3>
                            {["atk", "spa"].map((stat) => (
                                <div key={stat} className="stat-input">
                                    <label>{statLabels[stat]}: </label>
                                    <input
                                        type="number"
                                        value={attacker.ev[stat]}
                                        onChange={(e) =>
                                            handleInputChange("attacker", "ev", stat, e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                            <h3>個体値 (IV)</h3>
                            {["atk", "spa"].map((stat) => (
                                <div key={stat} className="stat-input">
                                    <label>{statLabels[stat]}: </label>
                                    <input
                                        type="number"
                                        value={attacker.iv[stat]}
                                        onChange={(e) =>
                                            handleInputChange("attacker", "iv", stat, e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                            <h3>実数値</h3>
                            <p>
                                攻撃実数値: {calculateStat(attacker.baseStats.atk || 100, attacker.iv.atk, attacker.ev.atk, attacker.level)}<br/>
                                特攻実数値: {calculateStat(attacker.baseStats.spa || 100, attacker.iv.spa, attacker.ev.spa, attacker.level)}
                            </p>
                        </div>
                    </div>
                    <div className="pokemon-section">
                        <h2>防御側</h2>
                        <input
                            type="text"
                            placeholder="ポケモン名を入力"
                            value={defenderSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value, "defender")}
                            className="input-field"
                        />
                        {defenderSearchResults.length > 0 && (
                            <ul className="search-results compact">
                                {defenderSearchResults.map((pokemon) => (
                                    <li
                                        key={pokemon.id}
                                        onClick={() => handleSelectPokemon("defender", pokemon)}
                                    >
                                        {pokemon.name.jpn} ({pokemon.name.eng})
                                    </li>
                                ))}
                            </ul>
                        )}
                        {defender.image && (
                            <img
                                src={defender.image}
                                alt={defender.name}
                                className="pokemon-image"
                            />
                        )}
                        <div className="stat-section">
                            <h3>種族値</h3>
                            <p>
                                HP: {defender.baseStats.hp || "不明"} <br/>
                                攻撃: {defender.baseStats.atk || "不明"} <br/>
                                防御: {defender.baseStats.def || "不明"} <br/>
                                特攻: {defender.baseStats.spa || "不明"} <br/>
                                特防: {defender.baseStats.spd || "不明"} <br/>
                                素早さ: {defender.baseStats.spe || "不明"}
                            </p>
                            <h3>努力値 (EV)</h3>
                            {["hp", "def", "spd"].map((stat) => (
                                <div key={stat} className="stat-input">
                                    <label>{statLabels[stat]}: </label>
                                    <input
                                        type="number"
                                        value={defender.ev[stat]}
                                        onChange={(e) =>
                                            handleInputChange("defender", "ev", stat, e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                            <h3>個体値 (IV)</h3>
                            {["hp", "def", "spd"].map((stat) => (
                                <div key={stat} className="stat-input">
                                    <label>{statLabels[stat]}: </label>
                                    <input
                                        type="number"
                                        value={defender.iv[stat]}
                                        onChange={(e) =>
                                            handleInputChange("defender", "iv", stat, e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                            <p>
                                HP実数値: {(() => {
                                console.log("HP計算データ:", {
                                    base: defender.baseStats.hp,
                                    iv: defender.iv.hp,
                                    ev: defender.ev.hp,
                                    level: defender.level
                                });
                                return calculateHP(defender.baseStats.hp || 100, defender.iv.hp, defender.ev.hp, defender.level);
                            })()}<br/>
                                防御実数値: {(() => {
                                console.log("防御計算データ:", {
                                    base: defender.baseStats.def,
                                    iv: defender.iv.def,
                                    ev: defender.ev.def,
                                    level: defender.level
                                });
                                return calculateStat(defender.baseStats.def || 100, defender.iv.def, defender.ev.def, defender.level);
                            })()}<br/>
                                特防実数値: {(() => {
                                console.log("特防計算データ:", {
                                    base: defender.baseStats.spd,
                                    iv: defender.iv.spd,
                                    ev: defender.ev.spd,
                                    level: defender.level
                                });
                                return calculateStat(defender.baseStats.spd || 100, defender.iv.spd, defender.ev.spd, defender.level);
                            })()}
                            </p>
                        </div>
                    </div>
                </div>
                <button onClick={calculateDamage} className="button">
                    ダメージ計算
                </button>
                {damageResult && (
                    <div>
                        <h2>計算結果</h2>
                        <p>与えるダメージ: {damageResult.minDamage} ～ {damageResult.maxDamage}</p>
                        <p>
                            必要な攻撃回数:{" "}
                            {damageResult.hitsRequiredMin === 1
                                ? "確定1発"
                                : `${damageResult.hitsRequiredMin} ～ ${damageResult.hitsRequiredMax}回`}
                        </p>
                    </div>
                )}
                {showMoveModal && (
                    <div className="modal">
                        <h2>技を選択</h2>
                        <ul>
                            {attacker.moves.map((move, index) => (
                                <li key={index} onClick={() => handleMoveSelection(move)}>
                                    <p>名前: {move.name}</p>
                                    <p>威力: {move.power}</p>
                                    <p>タイプ: {getTranslatedType(move.type)}</p>
                                    <p>
                                        分類: {move.category === "physical"
                                        ? "物理"
                                        : move.category === "special"
                                            ? "特殊"
                                            : "変化"}
                                    </p>

                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowMoveModal(false)} className="button">
                            閉じる
                        </button>
                    </div>
                )}
            </div>
        </div>

            );
            };

            export default DamageCalculatorPage;