"use client";

import React, { useState } from "react";
import { fetchPokemonDetails } from "../api/pokemon";
import pokemonData from "../party-builder/data/Pokemon.json";
import "./styles.css";

const DamageCalculatorPage = () => {
    const [attacker, setAttacker] = useState({
        name: "",
        image: "",
        moves: [],
        selectedMove: null,
    });
    const [defender, setDefender] = useState({
        name: "",
        image: "",
    });

    const [showMoveModal, setShowMoveModal] = useState(false);
    const [damageResult, setDamageResult] = useState(null);
    const [attackerSearchQuery, setAttackerSearchQuery] = useState("");
    const [attackerSearchResults, setAttackerSearchResults] = useState([]);

    const [defenderSearchQuery, setDefenderSearchQuery] = useState("");
    const [defenderSearchResults, setDefenderSearchResults] = useState([]);

    // 攻撃側ポケモン検索
    const handleAttackerSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setAttackerSearchQuery(query);

        if (query.trim() === "") {
            setAttackerSearchResults([]);
            return;
        }

        const results = pokemonData.filter(
            (pokemon) =>
                pokemon.name.jpn.includes(query) ||
                pokemon.name.eng.toLowerCase().includes(query)
        );

        setAttackerSearchResults(results);
    };

    // 防御側ポケモン検索
    const handleDefenderSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setDefenderSearchQuery(query);

        if (query.trim() === "") {
            setDefenderSearchResults([]);
            return;
        }

        const results = pokemonData.filter(
            (pokemon) =>
                pokemon.name.jpn.includes(query) ||
                pokemon.name.eng.toLowerCase().includes(query)
        );

        setDefenderSearchResults(results);
    };

    // ポケモン選択
    const handleSelectPokemon = (role, pokemon) => {
        fetchPokemonDetails(pokemon.name.eng.toLowerCase()).then((details) => {
            if (role === "attacker") {
                setAttacker({
                    ...attacker,
                    name: details.name,
                    image: details.official_artwork,
                    moves: details.moves,
                });
                setAttackerSearchQuery("");
                setAttackerSearchResults([]);
            } else {
                setDefender({
                    ...defender,
                    name: details.name,
                    image: details.official_artwork,
                });
                setDefenderSearchQuery("");
                setDefenderSearchResults([]);
            }
        });
    };

    // 技選択モーダルの表示
    const handleOpenMoveModal = () => {
        if (!attacker.moves.length) {
            alert("技が見つかりません。ポケモンを選択してください。");
            return;
        }
        setShowMoveModal(true);
    };

    // 技を選択
    const handleMoveSelection = (move) => {
        setAttacker({ ...attacker, selectedMove: move });
        setShowMoveModal(false);
    };

    const handleCalculateDamage = () => {
        if (!attacker.selectedMove) {
            alert("技を選択してください！");
            return;
        }

        // ダメージ計算（仮の計算式）
        const damage = Math.floor((50 * attacker.selectedMove.power) / 80);
        const hitsRequired = Math.ceil(100 / damage);

        setDamageResult({
            damage,
            hitsRequired,
        });
    };

    return (
        <div>
            <h1>ダメージ計算ツール</h1>
            <div className="container">
                {/* 攻撃側 */}
                <div className="pokemon-section">
                    <h2>攻撃側</h2>
                    <input
                        type="text"
                        placeholder="ポケモン名を入力"
                        value={attackerSearchQuery}
                        onChange={handleAttackerSearchChange}
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
                            <p>タイプ: {attacker.selectedMove.type}</p>
                        </div>
                    )}
                </div>

                {/* 防御側 */}
                <div className="pokemon-section">
                    <h2>防御側</h2>
                    <input
                        type="text"
                        placeholder="ポケモン名を入力"
                        value={defenderSearchQuery}
                        onChange={handleDefenderSearchChange}
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
                </div>
            </div>

            <button onClick={handleCalculateDamage} className="button">
                ダメージ計算
            </button>
            {damageResult && (
                <div>
                    <h2>結果</h2>
                    <p>与えるダメージ: {damageResult.damage}</p>
                    <p>
                        必要な攻撃回数:{" "}
                        {damageResult.hitsRequired === 1 ? "確定1発" : `${damageResult.hitsRequired}回`}
                    </p>
                </div>
            )}

            {/* 技選択モーダル */}
            {showMoveModal && (
                <div className="modal">
                    <h2>技を選択</h2>
                    <ul>
                        {attacker.moves.map((move, index) => (
                            <li
                                key={index}
                                onClick={() => handleMoveSelection(move)}
                            >
                                <p>名前: {move.name}</p>
                                <p>威力: {move.power}</p>
                                <p>タイプ: {move.type}</p>
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
