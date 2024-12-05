"use client";

import React, { useState } from 'react';
import {
    fetchPokemonDetails,
    calculateTotalStats,
    findAdvantageousType,
    fetchAdvantageousPokemons,
    filterByStats,
} from '../api/pokemon';
import typesEffectiveness from './data/typeEffectiveness.json';
import pokemonData from './data/Pokemon.json';

// Helper function to map Japanese name to English
const getEnglishName = (japaneseName) => {

    const pokemon = pokemonData.find((p) => p.name.jpn === japaneseName);

    return pokemon ? pokemon.name.eng : null;
};

// Helper function to map English name to Japanese

const getJapaneseName = (englishName) => {
    const pokemon = pokemonData.find((p) => p.name.eng.toLowerCase() === englishName.toLowerCase());
    return pokemon ? pokemon.name.jpn : null;

};

// ランダムに要素を選択する関数
const getRandomElements = (array, num) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
};

const Home = () => {

    const [searchBars, setSearchBars] = useState([{ id: 1, pokemonName: 'フシギダネ', result: [] }]); // 初期の検索バーと結果
    const [loading, setLoading] = useState(false); // ローディング状態

    const handleSubmit = async (event, id, pokemonName) => {
        event.preventDefault();
        setLoading(true);

        try {

            console.log('検索されたポケモン名:', pokemonName); // デバッグ用ログ

            // Convert Japanese name to English before search
            const englishName = getEnglishName(pokemonName)?.toLowerCase();
            console.log('変換された英語名:', englishName); // デバッグ用ログ

            if (!englishName) {
                alert('入力されたポケモン名が見つかりませんでした');
                setLoading(false);
                return;
            }

            // Fetch opponent Pokemon details

            const opponentDetails = await fetchPokemonDetails(englishName);
            console.log('取得したポケモンの詳細:', opponentDetails); // デバッグ用ログ

            const opponentTypes = opponentDetails.types;

            // Calculate advantageous type
            const effectivenessMap = Object.keys(typesEffectiveness).map((type) => ({
                type,
                effectiveness: findAdvantageousType(opponentTypes, type),
            }));

            const maxEffectiveness = Math.max(...effectivenessMap.map((e) => e.effectiveness));
            const advantageousType = effectivenessMap.find((e) => e.effectiveness === maxEffectiveness);

            // Fetch advantageous Pokémon
            const advantageousPokemons = advantageousType
                ? await fetchAdvantageousPokemons(advantageousType.type)
                : [];



            console.log('有利なポケモン:', advantageousPokemons); // デバッグ用ログ

            // 470以上の種族値のポケモンをフィルタリング
            const filteredResults = await filterByStats(advantageousPokemons);
            console.log('フィルタリング後の結果:', filteredResults); // デバッグ用ログ


            // ランダムに5体選択
            const randomPokemons = getRandomElements(filteredResults, 5).map(pokemon => {
                const japaneseName = getJapaneseName(pokemon); // 日本語名を取得
                return {
                    ...pokemon,
                    name: japaneseName || pokemon // 日本語名がない場合は元の名前
                };
            });

            console.log('最終的な結果:', randomPokemons); // デバッグ用ログ

            setSearchBars(prev => prev.map(bar =>
                bar.id === id ? { ...bar, result: randomPokemons } : bar
            ));
          
        } catch (error) {
            console.error('エラーの詳細:', error); // デバッグ用ログ
            alert('エラーが発生しました。再度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>

            {searchBars.map(bar => (
                <form key={bar.id} onSubmit={(e) => handleSubmit(e, bar.id, bar.pokemonName)}>
                    <input
                        type="text"
                        value={bar.pokemonName}
                        onChange={(e) => setSearchBars(prev => prev.map(b =>
                            b.id === bar.id ? { ...b, pokemonName: e.target.value } : b
                        ))}
                        placeholder="ポケモン名を入力"
                    />
                    <button type="submit">検索</button>
                </form>
            ))}

            {loading && <p>検索中...</p>}

            {searchBars.map(bar => (
                <div key={bar.id}>
                    {bar.result.length > 0 ? (
                        bar.result.map((pokemon, index) => (
                            <div key={pokemon.id || `${pokemon.name}-${index}`}>
                                {pokemon.official_artwork ? (
                                    <img src={pokemon.official_artwork} alt={pokemon.name} />
                                ) : (
                                    <p>画像が見つかりません</p>
                                )}
                                <p>{pokemon.name || '名前が不明です'}</p>
                            </div>
                        );
                        })
                    ) : (
                        <p>結果が見つかりませんでした</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Home;
