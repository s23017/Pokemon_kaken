import typesEffectiveness from '../data/typeEffectiveness.json';

// ポケモン詳細を取得
export const fetchPokemonDetails = async (pokemonName) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const data = await response.json();
    return {
        name: data.name,
        types: data.types.map(typeInfo => typeInfo.type.name),
    };
};

// 有利なポケモンの計算
export const findAdvantageousType = (opponentTypes, myType) => {
    const type1 = opponentTypes[0];
    const type2 = opponentTypes[1] || null;

    let effectiveness1 = typesEffectiveness[type1]?.[myType] || 1.0; // type1との相性
    let effectiveness2 = type2 ? (typesEffectiveness[type2]?.[myType] || 1.0) : 1.0; // type2との相性

    return effectiveness1 * effectiveness2; // 相性を掛け算
};

// 有利なタイプのポケモンを取得
export const fetchAdvantageousPokemons = async (advantageousType) => {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${advantageousType}`);
    const data = await response.json();
    return data.pokemon.map(poke => poke.pokemon.name);
};