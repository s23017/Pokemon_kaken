"use client";

import React, { useState } from 'react';
import {
    fetchPokemonDetails,
    calculateTotalStats,
    findAdvantageousType,
    fetchAdvantageousPokemons,
    filterByStats
} from '../api/pokemon';
import typesEffectiveness from './data/typeEffectiveness.json';

const Home = () => {
    const [opponentPokemon, setOpponentPokemon] = useState('charizard'); // デフォルトのポケモン
    const [advantageousPokemons, setAdvantageousPokemons] = useState([]);
    const [filteredPokemons, setFilteredPokemons] = useState([]);
    const [loading, setLoading] = useState(false); // ローディング状態

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // ローディング開始
        setFilteredPokemons([]); // フィルタリング結果をリセット

        try {
            const opponentDetails = await fetchPokemonDetails(opponentPokemon);
            const opponentTypes = opponentDetails.types;

            const effectivenessMap = Object.keys(typesEffectiveness).map(type => ({
                type,
                effectiveness: findAdvantageousType(opponentTypes, type),
            }));

            // 最大倍率のタイプを取得
            const maxEffectiveness = Math.max(...effectivenessMap.map(e => e.effectiveness));
            const advantageousType = effectivenessMap.find(e => e.effectiveness === maxEffectiveness);

            // 有利なポケモンを取得
            const advantageousPokemons = advantageousType
                ? await fetchAdvantageousPokemons(advantageousType.type)
                : [];

            setAdvantageousPokemons(advantageousPokemons); // 有利なポケモンのリストを状態に保存

            // 470以上の種族値のポケモンをフィルタリング
            const filteredResults = await filterByStats(advantageousPokemons);

            setFilteredPokemons(filteredResults); // フィルタリング後のポケモンを更新

        } catch (error) {
            console.error("Error fetching Pokémon details:", error);
        } finally {
            setLoading(false); // ローディング終了
        }
    };

    return (
        <div>
            <h1>ポケモンの有利なタイプを計算</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={opponentPokemon}
                    onChange={(e) => setOpponentPokemon(e.target.value)}
                    placeholder="ポケモンの名前を入力"
                />
                <button type="submit">検索</button>
            </form>

            {loading && <p>ロード中...</p>} {/* ローディング中のメッセージ */}

            <h2>{opponentPokemon}に対する有利なポケモン（種族値470以上）:</h2>
            <ul>
                {filteredPokemons.length > 0 ? (
                    filteredPokemons.map(pokemon => (
                        <li key={pokemon}>{pokemon}</li>
                    ))
                ) : (
                    <p>該当するポケモンは見つかりませんでした。</p>
                )}
            </ul>
        </div>
    );
};

export default Home;