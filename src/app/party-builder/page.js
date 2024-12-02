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
    const [searchBars, setSearchBars] = useState([{ id: 1, pokemonName: 'charizard', result: [] }]); // 初期の検索バーと結果
    const [loading, setLoading] = useState(false); // ローディング状態

    const handleSubmit = async (event, id, pokemonName) => {
        event.preventDefault();
        setLoading(true);

        try {
            // 相手のポケモンの詳細を取得
            const opponentDetails = await fetchPokemonDetails(pokemonName);
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

            // 470以上の種族値のポケモンをフィルタリング
            const filteredResults = await filterByStats(advantageousPokemons);

            // ランダムに5体選択
            const randomPokemons = getRandomElements(filteredResults, 5);

            setSearchBars(prev => prev.map(bar =>
                bar.id === id ? { ...bar, result: randomPokemons } : bar
            ));

        } catch (error) {
            console.error("Error fetching Pokémon details:", error);
        } finally {
            setLoading(false);
        }
    };

    // ランダムにn個の要素を配列から選ぶ関数
    const getRandomElements = (arr, n) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random()); // 配列をシャッフル
        return shuffled.slice(0, n); // 最初のn個を返す
    };

    // 検索バーを追加
    const addSearchBar = () => {
        setSearchBars(prev => [
            ...prev,
            { id: prev.length + 1, pokemonName: '', result: [] },
        ]);
    };

    // 検索バーの入力が変更されたとき
    const handleChange = (id, value) => {
        setSearchBars(prev =>
            prev.map(bar =>
                bar.id === id ? { ...bar, pokemonName: value } : bar
            )
        );
    };

    // 検索バーを削除
    const removeSearchBar = (id) => {
        setSearchBars(prev => prev.filter(bar => bar.id !== id)); // 指定したIDのバーを削除
    };

    return (
        <div>
            <h1>パーティー構築</h1>

            <form>
                {searchBars.map((bar) => (
                    <div key={bar.id}>
                        <input
                            type="text"
                            value={bar.pokemonName}
                            onChange={(e) => handleChange(bar.id, e.target.value)}
                            placeholder="ポケモンの名前を入力"
                        />
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, bar.id, bar.pokemonName)}
                        >
                            検索
                        </button>
                        {/* マイナスボタンを追加 */}
                        {searchBars.length > 1 && (
                            <button type="button" onClick={() => removeSearchBar(bar.id)}>
                                -
                            </button>
                        )}

                        {/* 検索結果 */}
                        {loading && <p>ロード中...</p>}
                        {bar.result.length > 0 && (
                            <div>
                                <h2>{bar.pokemonName}に対する有利なポケモン</h2>
                                <ul>
                                    {bar.result.map(pokemon => (
                                        <li key={pokemon}>{pokemon}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addSearchBar}>
                    +
                </button>
            </form>
        </div>
    );
};

export default Home;
