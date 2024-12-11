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
    const [notTranslatedPokemons, setNotTranslatedPokemons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const handleInputChange = (id, value) => {
        setSearchBars((prev) =>
            prev.map((bar) =>
                bar.id === id ? { ...bar, pokemonName: value } : bar
            )
        );

        // Suggestion filtering
        if (value) {
            const filteredSuggestions = pokemonData
                .filter((pokemon) =>
                    pokemon.name.jpn.startsWith(value) ||
                    pokemon.name.eng.toLowerCase().startsWith(value.toLowerCase())
                )
                .map((pokemon) => pokemon.name.jpn);
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (id, suggestion) => {
        setSearchBars((prev) =>
            prev.map((bar) =>
                bar.id === id ? { ...bar, pokemonName: suggestion } : bar
            )
        );
        setSuggestions([]);
    };

    const handleSubmit = async (event, id, pokemonName) => {
        event.preventDefault();
        setLoading(true);
        try {
            const englishName = getEnglishName(pokemonName);
            if (!englishName) {
                alert('入力されたポケモン名が見つかりませんでした');
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

            const untranslatedPokemons = filteredResults
                .filter((pokemon) => !getJapaneseName(pokemon.name))
                .map((pokemon) => ({
                    ...pokemon,
                    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
                }));
            setNotTranslatedPokemons(untranslatedPokemons);

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
                        onChange={(e) => handleInputChange(bar.id, e.target.value)}
                        placeholder="ポケモン名を入力"
                    />
                    <button type="submit">検索</button>
                    {suggestions.length > 0 && (
                        <ul style={styles.suggestionsList}>
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSuggestionClick(bar.id, suggestion)}
                                    style={styles.suggestionItem}
                                >
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}
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
                                    <img
                                        src={pokemon.official_artwork || spriteUrl}
                                        alt={pokemon.name}
                                    />
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

const styles = {
    suggestionsList: {
        maxHeight: '150px',
        overflowY: 'auto',
        border: '1px solid #ccc',
        padding: '0',
        margin: '5px 0',
        listStyle: 'none',
        backgroundColor: '#fff',
    },
    suggestionItem: {
        padding: '10px',
        cursor: 'pointer',
    },
};

export default Home;
