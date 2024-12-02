import typesEffectiveness from '../party-builder/data/typeEffectiveness.json'; // 相性データをここでインポート

// ポケモンの詳細を取得する関数
export const fetchPokemonDetails = async (pokemonName) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const data = await response.json();
    return {
        name: data.name,
        types: data.types.map(typeInfo => typeInfo.type.name),
    };
};

// タイプの相性を計算する関数
export const findAdvantageousType = (opponentTypes, myType) => {
    const type1 = opponentTypes[0];
    const type2 = opponentTypes[1] || null;

    let effectiveness1 = typesEffectiveness[type1]?.[myType] || 1.0;
    let effectiveness2 = typesEffectiveness[type2]?.[myType] || 1.0;

    return effectiveness1 * effectiveness2;
};

// 有利なタイプのポケモンを取得する関数
export const fetchAdvantageousPokemons = async (type) => {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    const data = await response.json();
    return data.pokemon.map(pokemonEntry => pokemonEntry.pokemon.name);
};