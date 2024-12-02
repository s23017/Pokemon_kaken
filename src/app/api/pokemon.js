import typesEffectiveness from '../party-builder/data/typeEffectiveness.json'; // 相性データをここでインポート

// ポケモンの詳細を取得する関数
export const fetchPokemonDetails = async (pokemonName) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const data = await response.json();
    return {
        name: data.name,
        types: data.types.map(typeInfo => typeInfo.type.name),
        stats: data.stats // statsも含めて返す
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

// 合計種族値計算
export const calculateTotalStats = (stats) => {
    return stats.reduce((total, stat) => total + stat.base_stat, 0);
};

// 470以上の種族値のポケモンをフィルタリングする関数
export const filterByStats = async (pokemons) => {
    const filteredPokemons = [];
    for (let pokemon of pokemons) {
        const pokemonDetails = await fetchPokemonDetails(pokemon); // ポケモンの詳細情報を取得
        const totalStats = calculateTotalStats(pokemonDetails.stats); // 種族値合計を計算

        console.log(`${pokemon} - Total Stats: ${totalStats}`); // デバッグ用

        if (totalStats >= 470) {
            filteredPokemons.push(pokemon); // 種族値合計が470以上のポケモンを追加
        }
    }
    return filteredPokemons;
};