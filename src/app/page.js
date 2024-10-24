import {
    fetchPokemonDetails,
    findAdvantageousType,
    fetchAdvantageousPokemons,
} from './api/pokemon'; // 必要な関数のインポート
import typesEffectiveness from './data/typeEffectiveness.json'; // タイプ相性データのインポート

const Home = async () => {
    // 相手のポケモンを選ぶ
    const opponentPokemon = 'dragonite'; // 例: リザードン
    const opponentDetails = await fetchPokemonDetails(opponentPokemon); // ポケモンの詳細取得
    const opponentTypes = opponentDetails.types; // タイプの取得

    // 一番効果的なタイプを計算する
    const advantageousType = Object.keys(typesEffectiveness).reduce((bestType, currentType) => {
        const effectiveness = findAdvantageousType(opponentTypes, currentType); // 相性を計算
        const bestEffectiveness = bestType ? findAdvantageousType(opponentTypes, bestType) : 0;
        return effectiveness > bestEffectiveness ? currentType : bestType; // 最も高い倍率のタイプを選ぶ
    }, null);

    // 有利なタイプに基づいてポケモンを取得
    const advantageousPokemons = advantageousType ? await fetchAdvantageousPokemons(advantageousType) : [];

    return (
        <div>
            <h1>{opponentPokemon} に対する有利なタイプ: {advantageousType}</h1>
            <p>効果が最も高いのは: {advantageousType}</p>
            <h2>有利なポケモン:</h2>
            <ul>
                {advantageousPokemons.map(pokemon => (
                    <li key={pokemon}>{pokemon}</li>
                ))}
            </ul>
        </div>
    );
};

export default Home;