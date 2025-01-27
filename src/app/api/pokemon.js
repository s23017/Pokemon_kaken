import typesEffectiveness from '../party-builder/data/typeEffectiveness.json';
import japaneseName from "pg/lib/query"; // 相性データをここでインポート
import abilitiesData from "../party-builder/data/abilities.json";

// ポケモンの詳細を取得する関数
// ポケモンの詳細を取得する関数
export const fetchPokemonDetails = async (pokemonName) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch Pokemon details: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("APIデータ:", data); // デバッグ用

        const statMapping = {
            hp: "hp",
            attack: "atk",
            defense: "def",
            "special-attack": "spa",
            "special-defense": "spd",
            speed: "spe",
        };


        // const stats = data.stats.map((stat) => ({
        //     base_stat: stat.base_stat,
        //     name: statMapping[stat.stat.name] || stat.stat.name,
        // }));
        //
        // const moves = await Promise.all(
        //     data.moves.map(async (move) => {
        //         const moveDetails = await fetch(move.move.url).then((res) => res.json());
        //         return {
        //             name: moveDetails.names.find((name) => name.language.name === "ja")?.name || moveDetails.name,
        //             power: moveDetails.power || "不明",
        //             type: moveDetails.type.name,
        //             category: moveDetails.damage_class.name, // 技の分類
        //         };
        //     })
        // );


        // 特性を取得して統合
        const abilities = await fetchPokemonAbilities(pokemonName);

        return {
            name: data.name,
            types: data.types.map(typeInfo => typeInfo.type.name),
            stats: data.stats,
            sprite: data.sprites.front_default,
            official_artwork: data.sprites.other['official-artwork'].front_default,
            moves: data.moves.map(move => move.move.name),
            abilities, // 特性を統合

        };
    } catch (error) {
        console.error(`Error fetching details for ${pokemonName}:`, error);
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
// ポケモンの特性を取得する関数
// 特性を取得する関数
const fetchPokemonAbilities = (pokemonName) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch abilities for ${pokemonName}`);
            }
            return response.json();
        })
        .then((data) =>
            Promise.all(
                data.abilities.map((abilityInfo) => {
                    const abilityUrl = abilityInfo.ability.url;
                    return fetch(abilityUrl)
                        .then((res) => res.json())
                        .then((abilityData) => {
                            const japaneseName = abilityData.names.find(
                                (nameEntry) => nameEntry.language.name === "ja"
                            );
                            const effectEntry = abilityData.effect_entries.find(
                                (entry) => entry.language.name === "ja"
                            );
                            return {
                                name: japaneseName ? japaneseName.name : abilityInfo.ability.name,
                                effect: effectEntry ? effectEntry.effect : "効果不明",
                            };
                        });
                })
            )
        );
};


const abilities = await fetchPokemonAbilities("pikachu");
console.log(abilities);

// 特性取得テスト
/*
[
    { name: "せいでんき", isHidden: false, effect: "電気技を受けると...", shortEffect: "電気技を無効化" },
    { name: "ひらいしん", isHidden: true, effect: "電気技を吸収して...", shortEffect: "電気技を吸収" }
]
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
const displayPokemonDetails = async () => {
    const details = await fetchPokemonDetails("pikachu");
    console.log(details);
};

displayPokemonDetails();

