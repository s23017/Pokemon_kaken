"use client"; // クライアントコンポーネントとして宣言

import { useState } from 'react';
import { fetchPokemonDetails, findAdvantageousType } from './api/pokemon';

const PokemonList = ({ pokemons }) => {
    const [effectivePokemon, setEffectivePokemon] = useState([]);

    const handlePokemonSelect = async (selectedPokemon) => {
        const response = await fetchPokemonDetails(selectedPokemon);
        const opponentTypes = response.types; // リザードンのタイプを取得

        const allPokemons = await Promise.all(pokemons.map(pokemon => fetchPokemonDetails(pokemon.name)));

        // 全ポケモンに対して有利なタイプを計算
        const effectivenessResults = allPokemons.map(pokemon => ({
            name: pokemon.name,
            effectiveness: findAdvantageousType(opponentTypes, '水') // 水タイプを例に計算
        }));

        // 効果の高いポケモンをフィルタリング
        const filteredPokemons = effectivenessResults.filter(p => p.effectiveness > 1.0); // 有利なポケモンのみ
        setEffectivePokemon(filteredPokemons);
    };

    return (
        <div>
            <ul>
                {pokemons.map((pokemon) => (
                    <li key={pokemon.name} onClick={() => handlePokemonSelect(pokemon.name)}>
                        {pokemon.name}
                    </li>
                ))}
            </ul>
            <h2>Effective Pokémon</h2>
            <ul>
                {effectivePokemon.map(({ name }) => (
                    <li key={name}>{name}</li>
                ))}
            </ul>
        </div>
    );
};

export default PokemonList;