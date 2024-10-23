"use client"; // クライアントコンポーネントとして宣言

import { useState } from 'react';
import { getEffectiveTypes } from './api/typeEffectiveness';

const PokemonList = ({ pokemons }) => {
    const [effectivePokemon, setEffectivePokemon] = useState([]);

    const handlePokemonSelect = async (selectedPokemon) => {
        const response = await fetchPokemonDetails(selectedPokemon); // ここでAPIを呼び出す
        const opponentTypes = response.types.map(typeInfo => typeInfo.type.name);
        const effectiveTypes = getEffectiveTypes(opponentTypes[0]);

        // 有利なポケモンをフィルタリングしてセット
        const filteredPokemons = pokemons.filter(pokemon => effectiveTypes.includes(pokemon.type));
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
                {effectivePokemon.map((pokemon) => (
                    <li key={pokemon.name}>{pokemon.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default PokemonList;