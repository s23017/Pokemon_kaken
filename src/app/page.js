import {
    fetchPokemonDetails,
    findAdvantageousType,
    fetchAdvantageousPokemons,
    fetchAdvantageousPokemons1, findAdvantageousType1
} from './api/pokemon';
import typesEffectiveness from './data/typeEffectiveness.json'; // ここでインポート

const Home = async () => {
    const opponentPokemon = 'charizard';// 相手ポケモンの名前
    // const opponentPokemon1 = 'bulbasaur';// 相手ポケモンの名前
    // const opponentPokemon2 = 'ivysaur';// 相手ポケモンの名前
    // const opponentPokemon3 = 'pidgey';// 相手ポケモンの名前
    // const opponentPokemon4 = 'rattata';// 相手ポケモンの名前
    const opponentDetails = await fetchPokemonDetails(opponentPokemon);
    const opponentTypes = opponentDetails.types;
    // const opponentTypes1 = opponentDetails.types;

    const myType = 'rock'; // 自分のポケモンのタイプ
    const effectiveness = findAdvantageousType(opponentTypes, myType);

    // 有利なタイプを取得
    const advantageousType = Object.keys(typesEffectiveness).find(type => findAdvantageousType(opponentTypes, type) > 1);
    const advantageousPokemons = advantageousType ? await fetchAdvantageousPokemons(advantageousType) : [];


    return (
        <div>
            <h1>{opponentPokemon}に対する有利なタイプ:</h1>
            {/*<h1>{opponentPokemon1}に対する有利なタイプ:</h1>*/}
            {/*<h1>{opponentPokemon2}に対する有利なタイプ:</h1>*/}
            {/*<h1>{opponentPokemon3}に対する有利なタイプ:</h1>*/}
            {/*<h1>{opponentPokemon4}に対する有利なタイプ:</h1>*/}
            <p>効果: {effectiveness}</p>
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