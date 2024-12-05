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
    const [searchBars, setSearchBars] = useState([{ id: 1, pokemonName: 'フシギダネ', result: [] }]);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event, id, pokemonName) => {
        event.preventDefault();
        setLoading(true);
        try {
            // Convert Japanese name to English
            const englishName = getEnglishName(pokemonName);
            if (!englishName) {
                alert('入力されたポケモン名が見つかりませんでした');
                setLoading(false);
                return;
            }
            // Fetch opponent Pokemon details
            const opponentDetails = await fetchPokemonDetails(englishName.toLowerCase());
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
            // Filter by total stats >= 470
            const filteredResults = await filterByStats(advantageousPokemons);
            // Select 5 random Pokémon
            const randomPokemons = getRandomElements(filteredResults, 5).map((pokemon) => ({
                ...pokemon,
                name: getJapaneseName(pokemon.name) || pokemon.name,
            }));
            setSearchBars((prev) =>
                prev.map((bar) =>
                    bar.id === id ? { ...bar, result: randomPokemons } : bar
                )
            );
        } catch (error) {
            console.error('エラー:', error);
            alert('エラーが発生しました。再度お試しください。');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            {searchBars.map((bar) => (
                <form
                    key={bar.id}
                    onSubmit={(e) => handleSubmit(e, bar.id, bar.pokemonName)}
                >
                    <input
                        type="text"
                        value={bar.pokemonName}
                        onChange={(e) =>
                            setSearchBars((prev) =>
                                prev.map((b) =>
                                    b.id === bar.id
                                        ? { ...b, pokemonName: e.target.value }
                                        : b
                                )
                            )
                        }
                        placeholder="ポケモン名を入力"
                    />
                    <button type="submit">検索</button>
                </form>
            ))}
            {loading && <p>検索中...</p>}
            {searchBars.map((bar) => (
                <div key={bar.id}>
                    {bar.result.length > 0 ? (
                        bar.result.map((pokemon, index) => {
                            const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                            return (
                                <div key={pokemon.id || index}>
                                    {pokemon.official_artwork ? (
                                        <img
                                            src={pokemon.official_artwork}
                                            alt={pokemon.name}
                                        />
                                    ) : (
                                        <img src={spriteUrl} alt={pokemon.name} />
                                    )}
                                    <p>{pokemon.name}</p>
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