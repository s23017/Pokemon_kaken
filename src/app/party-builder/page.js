"use client";

import React, { useState } from 'react';
import {
    fetchPokemonDetails,
    findAdvantageousType,
    fetchAdvantageousPokemons,
} from '../api/pokemon';
import typesEffectiveness from './data/typeEffectiveness.json';

const Home = () => {
    const [opponentPokemon, setOpponentPokemon] = useState('charizard'); // デフォルトのポケモン
    const [advantageousPokemons, setAdvantageousPokemons] = useState([]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const opponentDetails = await fetchPokemonDetails(opponentPokemon);
        const opponentTypes = opponentDetails.types;

        const effectivenessMap = Object.keys(typesEffectiveness).map(type => ({
            type,
            effectiveness: findAdvantageousType(opponentTypes, type)
        }));

        // 最大倍率のタイプを取得
        const maxEffectiveness = Math.max(...effectivenessMap.map(e => e.effectiveness));
        const advantageousType = effectivenessMap.find(e => e.effectiveness === maxEffectiveness);

        // 有利なポケモンを取得
        const advantageousPokemons = advantageousType ? await fetchAdvantageousPokemons(advantageousType.type) : [];

        setAdvantageousPokemons(advantageousPokemons); // 状態を更新
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
            <h2>{opponentPokemon}に対する有利なポケモン:</h2>
            <ul>
                {advantageousPokemons.map(pokemon => (
                    <li key={pokemon}>{pokemon}</li>
                ))}
            </ul>
        </div>
    );
};

export default Home;