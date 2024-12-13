import typesEffectiveness from '../party-builder/data/typeEffectiveness.json'; // 相性データをここでインポート

// ポケモンの詳細を取得する関数
export const fetchPokemonDetails = async (pokemonName) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const data = await response.json();
    return {
        name: data.name,
        types: data.types.map(typeInfo => typeInfo.type.name),
        stats: data.stats,
        sprite: data.sprites.front_default,
        official_artwork: data.sprites.other['official-artwork'].front_default,
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

// 種族値フィルタリング
export const filterByStats = async (pokemons) => {
    const detailsPromises = pokemons.map(async (pokemonName) => {
        const pokemonDetails = await fetchPokemonDetails(pokemonName);
        const totalStats = calculateTotalStats(pokemonDetails.stats);
        return { details: pokemonDetails, totalStats };
    });

    const allDetails = await Promise.all(detailsPromises);
    const filteredPokemons = allDetails
        .filter(({ totalStats, details }) =>
            totalStats >= 470 &&
            !details.name.toLowerCase().includes('-gmax') &&
            !details.name.toLowerCase().includes('-mega')&&
            !details.name.toLowerCase().includes('-small')&&
            !details.name.toLowerCase().includes('-large')&&
            !details.name.toLowerCase().includes('-super')&&
            !details.name.toLowerCase().includes('-totem')&&
            !details.name.toLowerCase().includes('-dada')&&
            !details.name.toLowerCase().includes('-zen')&&
            !details.name.toLowerCase().includes('-droopy')&&
            !details.name.toLowerCase().includes('-stretchy')&&
            !details.name.toLowerCase().includes('-ash')&&
            !details.name.toLowerCase().includes('-school')&&
            !details.name.toLowerCase().includes('-noice')&&
            !details.name.toLowerCase().includes('-gulping')&&
            !details.name.toLowerCase().includes('-gorging')&&
            !details.name.toLowerCase().includes('-low-power-mode')&&
            !details.name.toLowerCase().includes('-drive-mode')&&
            !details.name.toLowerCase().includes('-aquatic-mode')&&
            !details.name.toLowerCase().includes('-glide-mode')&&
            !details.name.toLowerCase().includes('--limited-build')&&
            !details.name.toLowerCase().includes('-sprinting-build')&&
            !details.name.toLowerCase().includes('-swimming-build')&&
            !details.name.toLowerCase().includes('-limited-build')&&
            !details.name.toLowerCase().includes('-eternamax')&&
            !details.name.toLowerCase().includes('-power-construct')&&
            !details.name.toLowerCase().includes('-orange')&&
            !details.name.toLowerCase().includes('-yellow')&&
            !details.name.toLowerCase().includes('-green')&&
            !details.name.toLowerCase().includes('-blue')&&
            !details.name.toLowerCase().includes('-indigo')&&
            !details.name.toLowerCase().includes('-busted')&&
            !details.name.toLowerCase().includes('-eternal')&&
            !details.name.toLowerCase().includes('-original')&&
            !details.name.toLowerCase().includes('-violet')&&
            !details.name.toLowerCase().includes('-battle-bond')&&
            !details.name.toLowerCase().includes('-gliding-build')
        )
        .map(({ details }) => details);

    return filteredPokemons;
};
