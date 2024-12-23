import typesEffectiveness from '../party-builder/data/typeEffectiveness.json'; // 相性データをここでインポート

// ポケモンの詳細を取得する関数
export const fetchPokemonDetails = async (pokemonName) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch Pokemon details: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            name: data.name,
            types: data.types.map(typeInfo => typeInfo.type.name),
            stats: data.stats,
            sprite: data.sprites.front_default,
            official_artwork: data.sprites.other['official-artwork'].front_default,
            moves: data.moves.map(move => move.move.name),
        };
    } catch (error) {
        return null;
    }
};
// ステータス名をAPIから取得する補助関数
// ステータス名を日本語で取得する補助関数
// ステータス名を日本語で取得する補助関数
const fetchStatNames = async () => {
    const statIds = [1, 2, 3, 4, 5, 6]; // ステータスID (1: HP, 2: 攻撃, ...)
    const statNames = {};

    // 各ステータスの日本語名を取得
    await Promise.all(
        statIds.map(async (id) => {
            const url = `https://pokeapi.co/api/v2/stat/${id}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch stat ${id}: ${response.statusText}`);
                }
                const data = await response.json();

                // 日本語名を取得
                const japaneseName = data.names.find(
                    (nameEntry) => nameEntry.language.name === 'ja'
                );
                statNames[data.name] = japaneseName ? japaneseName.name : data.name;
            } catch (error) {
                console.error(`Error fetching stat ${id}:`, error);
            }
        })
    );

    return statNames;
};

// ポケモンの種族値を取得する関数
export const fetchPokemonBaseStats = async (pokemonName) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
    try {
        // 日本語ステータス名を取得
        const statNames = await fetchStatNames();

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch Pokemon details: ${response.statusText}`);
        }
        const data = await response.json();

        // 種族値を抽出し、日本語化された名前を含める
        const baseStats = data.stats.map(stat => ({
            name: statNames[stat.stat.name] || stat.stat.name, // 日本語名 or デフォルト英語名
            base_stat: stat.base_stat, // 種族値
        }));

        return baseStats;
    } catch (error) {
        console.error(`Error fetching base stats for ${pokemonName}:`, error);
        return null; // エラー時は null を返す
    }
};



// 技リストを取得する関数
export const fetchPokemonMoves = async (pokemonName) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch Pokemon moves: ${response.statusText}`);
        }
        const data = await response.json();
        return data.moves.map((move) => move.move.name);
    } catch (error) {
        return [];
    }
};
export const fetchMoveDetails = async (moveName) => {
    const url = `https://pokeapi.co/api/v2/move/${moveName}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch move details: ${response.statusText}`);
        }
        const data = await response.json();

        // 技の日本語名を取得
        const japaneseName = data.names.find(
            (nameEntry) => nameEntry.language.name === "ja"
        );

        // 必要な情報を返す
        return {
            name: japaneseName ? japaneseName.name : moveName, // 日本語名または英語名
            type: data.type.name, // 技のタイプ
            power: data.power || "不明", // 威力 (null の場合は "不明")
            accuracy: data.accuracy || "不明", // 命中率 (null の場合は "不明")
        };
    } catch (error) {
        console.error(`Failed to fetch move details for ${moveName}:`, error);
        // エラー時には最低限の情報を返す
        return {
            name: moveName,
            type: "不明",
            power: "不明",
            accuracy: "不明",
        };
    }
};
const moveDetails = await fetchMoveDetails("flamethrower");
console.log(moveDetails);
/*
{
    name: "かえんほうしゃ",
    type: "fire",
    power: 90,
    accuracy: 100
}
*/



// タイプの相性を計算する関数
export const findAdvantageousType = (opponentTypes, myType) => {
    const type1 = opponentTypes[0];
    const type2 = opponentTypes[1] || null;
    const effectiveness1 = typesEffectiveness[type1]?.[myType] || 1.0;
    const effectiveness2 = typesEffectiveness[type2]?.[myType] || 1.0;
    return effectiveness1 * effectiveness2;
};

// 有利なタイプのポケモンを取得する関数
export const fetchAdvantageousPokemons = async (type) => {
    const url = `https://pokeapi.co/api/v2/type/${type}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch advantageous Pokemon: ${response.statusText}`);
        }
        const data = await response.json();
        return data.pokemon.map(pokemonEntry => pokemonEntry.pokemon.name);
    } catch (error) {
        return [];
    }
};

// 種族値470以上かつ特定の条件を満たさないポケモンをフィルタリング
export const filterByStats = async (pokemons) => {
    try {
        const detailsPromises = pokemons.map(async (pokemonName) => {
            const pokemonDetails = await fetchPokemonDetails(pokemonName);
            if (!pokemonDetails) return null;
            const totalStats = calculateTotalStats(pokemonDetails.stats);
            return { details: pokemonDetails, totalStats };
        });

        const allDetails = await Promise.all(detailsPromises);
        return allDetails
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
                !details.name.toLowerCase().includes('miraidon-')&&
                !details.name.toLowerCase().includes('koraidon-')&&
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
                !details.name.toLowerCase().includes('-blade')&&
                !details.name.toLowerCase().includes('-gliding-build')
            )
            .map(({ details }) => details);
    } catch (error) {
        return [];
    }
};

// 合計種族値を計算する関数
export const calculateTotalStats = (stats) => {
    return stats.reduce((total, stat) => total + stat.base_stat, 0);
};
