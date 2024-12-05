import typesEffectiveness from '../party-builder/data/typeEffectiveness.json'; // 相性データをここでインポート

// ポケモンの詳細を取得する関数
export const fetchPokemonDetails = async (pokemonName) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const data = await response.json();
    return {
        name: data.name,
        types: data.types.map(typeInfo => typeInfo.type.name),
        stats: data.stats, // statsも含めて返す
        sprite: data.sprites.front_default, // スプライト画像URLを含める
        official_artwork: data.sprites.other['official-artwork'].front_default, // 公式アートを含める
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

    // ポケモン名のみをリストとして返す
    return data.pokemon.map(pokemonEntry => pokemonEntry.pokemon.name);
};

// 合計種族値計算
export const calculateTotalStats = (stats) => {
    return stats.reduce((total, stat) => total + stat.base_stat, 0);
};

// 470以上の種族値のポケモンをフィルタリングする関数
export const filterByStats = async (pokemons) => {
    // ポケモンの詳細情報を並列に取得
    const detailsPromises = pokemons.map(async (pokemonName) => {
        const pokemonDetails = await fetchPokemonDetails(pokemonName);
        const totalStats = calculateTotalStats(pokemonDetails.stats);
        return { details: pokemonDetails, totalStats };
    });

    const allDetails = await Promise.all(detailsPromises);

    // 種族値合計が470以上のポケモンを抽出
    const filteredPokemons = allDetails
        .filter(({ totalStats }) => totalStats >= 470)
        .map(({ details }) => details);

    return filteredPokemons;
};
