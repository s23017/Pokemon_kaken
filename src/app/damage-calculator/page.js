"use client";

import React, { useState } from "react";
import { fetchPokemonDetails } from "../api/pokemon";
import pokemonData from "../party-builder/data/Pokemon.json";
import typesEffectiveness from "../party-builder/data/typeEffectiveness.json";
import "./styles.css";

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
        types:[]
    });

    const [defender, setDefender] = useState({
        name: "",
        image: "",
        moves: [],
        baseStats: {},
        iv: { hp: 31, def: 31, spd: 31 },
        ev: { hp: 0, def: 0, spd: 0 },
        level: 50,
        types:[]
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

    const handleSelectPokemon = (role, pokemon) => {
        fetchPokemonDetails(pokemon.name.eng.toLowerCase()).then((details) => {
            const statMapping = {
                hp: "hp",
                attack: "atk",
                defense: "def",
                "special-attack": "spa",
                "special-defense": "spd",
                speed: "spe",
                types: "typeEffectiveness",
                moves: "moves",
            };

            const baseStats = details.stats.reduce((acc, stat) => {
                acc[statMapping[stat.stat.name]] = stat.base_stat;
                return acc;
            }, {});



            if (role === "attacker") {
                setAttacker({
                    ...attacker,
                    name: details.name,
                    image: details.official_artwork,
                    moves: details.moves,
                    baseStats,
                    types: details.types, // タイプ情報を設定
                    level: 50,
                });
                setAttackerSearchQuery("");
                setAttackerSearchResults([]);
            } else {
                setDefender({
                    ...defender,
                    name: details.name,
                    image: details.official_artwork,
                    baseStats,
                    types: details.types, // タイプ情報を設定
                    level: 50,
                });
                setDefenderSearchQuery("");
                setDefenderSearchResults([]);
            }
        });
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

        const isPhysical = move.type === "physical";

        const attackStat = isPhysical
            ? calculateStat(attacker.baseStats.atk, attacker.iv.atk, attacker.ev.atk, level)
            : calculateStat(attacker.baseStats.spa, attacker.iv.spa, attacker.ev.spa, level);

        const defenseStat = isPhysical
            ? calculateStat(defender.baseStats.def, defender.iv.def, defender.ev.def, level)
            : calculateStat(defender.baseStats.spd, defender.iv.spd, defender.ev.spd, level);

        const hp = calculateHP(defender.baseStats.hp, defender.iv.hp, defender.ev.hp, level);

        const stab = attacker.moves.some((m) => m.type === move.type) ? 1.5 : 1.0;
        // タイプ相性計算
        let typeEffectiveness = 1.0;
        defender.types.forEach((defenderType) => {
            typeEffectiveness *= typesEffectiveness[move.type]?.[defenderType] || 1.0;
        });

        const critical = 1.5;
        const randomFactor = Math.random() * 0.15 + 0.85;

        const baseDamage =
            (((2 * level) / 5 + 2) * power * attackStat) / defenseStat / 50 + 2;

        const finalDamage = Math.floor(
            baseDamage * stab * typeEffectiveness * critical * randomFactor
        );

        setDamageResult({
            damage: finalDamage,
            hitsRequired: Math.ceil(hp / finalDamage),
            typeEffectiveness,
        });

    };
    fetch('https://pokeapi.co/api/v2/move/1/') // 例: 1番目のわざ（たきのぼり）の情報を取得
        .then(response => response.json())
        .then(data => {
            console.log(data.name);  // わざの名前
            console.log(data.power); // わざの威力
            console.log(data.type.name); // わざのタイプ
        });



    return (
        <div>
            <h1>ダメージ計算ツール</h1>
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
                    <div className="pokemon-types">
                        <h3>タイプ</h3>
                        {attacker.types.length > 0 ? (
                            <p>{attacker.types.join(", ")}</p>
                        ) : (
                            <p>不明</p>
                        )}
                    </div>

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
                            <p>タイプ: {attacker.selectedMove.type}</p>
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
                    <div className="pokemon-types">
                        <h3>タイプ</h3>
                        {defender.types.length > 0 ? (
                            <p>{defender.types.join(", ")}</p>
                        ) : (
                            <p>不明</p>
                        )}
                    </div>

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
                    <p>与えるダメージ: {damageResult.damage}</p>
                    <p>
                        必要な攻撃回数: {" "}
                        {damageResult.hitsRequired === 1 ? "確定1発" : `${damageResult.hitsRequired}回`}
                    </p>
                    <p>タイプ相性倍率: {damageResult.typeEffectiveness}</p>
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
                                <p>タイプ: {move.type}</p>
                                <p>分類: {move.category === "physical" ? "物理" : "特殊"}</p>
                            </li>
                        ))}
                    </ul>

                    <button onClick={() => setShowMoveModal(false)} className="button">
                        閉じる
                    </button>
                </div>
            )}
        </div>
    );
};

export default DamageCalculatorPage;
