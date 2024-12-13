"use client";
import React, { useState } from 'react';
import {
    fetchPokemonDetails,
    calculateTotalStats,
    findAdvantageousType,
    fetchAdvantageousPokemons,
    filterByStats,
} from '../api/pokemon';
import typesEffectiveness from './data/typeEffectiveness.json';
import pokemonData from './data/Pokemon.json';

// 日本語名から英語名を取得するヘルパー関数
const getEnglishName = (japaneseName) => {
    const pokemon = pokemonData.find((p) => p.name.jpn === japaneseName);
    return pokemon ? pokemon.name.eng : null;
};

// 英語名から日本語名を取得するヘルパー関数
const getJapaneseName = (englishName) => {
    const pokemon = pokemonData.find((p) => p.name.eng.toLowerCase() === englishName.toLowerCase());
    return pokemon ? pokemon.name.jpn : null;
};

// ランダムに要素を選択する関数
const getRandomElements = (array, num) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
};

const Home = () => {
    const [searchBars, setSearchBars] = useState([{ id: 1, pokemonName: 'フシギダネ', result: [] }]);
    const [notTranslatedPokemons, setNotTranslatedPokemons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [party, setParty] = useState([]); // パーティーに選ばれたポケモンを管理

    // 検索フォームが送信された時の処理
    const handleSubmit = async (event, id, pokemonName) => {
        event.preventDefault();
        setLoading(true);
        try {
            // 日本語名を英語名に変換
            const englishName = getEnglishName(pokemonName);
            if (!englishName) {
                alert('入力されたポケモン名が見つかりませんでした');
                setLoading(false);
                return;
            }
            // 対戦相手のポケモン情報を取得
            const opponentDetails = await fetchPokemonDetails(englishName.toLowerCase());
            const opponentTypes = opponentDetails.types;
            // 有利なタイプを計算
            const effectivenessMap = Object.keys(typesEffectiveness).map((type) => ({
                type,
                effectiveness: findAdvantageousType(opponentTypes, type),
            }));
            const maxEffectiveness = Math.max(...effectivenessMap.map((e) => e.effectiveness));
            const advantageousType = effectivenessMap.find((e) => e.effectiveness === maxEffectiveness);
            // 有利なポケモンを取得
            const advantageousPokemons = advantageousType
                ? await fetchAdvantageousPokemons(advantageousType.type)
                : [];
            // ステータス合計が470以上のポケモンで絞り込む
            const filteredResults = await filterByStats(advantageousPokemons);

            // 日本語名が取得できないポケモンをフィルタリングして保存
            const untranslatedPokemons = filteredResults
                .filter((pokemon) => !getJapaneseName(pokemon.name))
                .map((pokemon) => ({
                    ...pokemon,
                    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
                }));
            setNotTranslatedPokemons(untranslatedPokemons);

            // 5匹のポケモンをランダムに選択
            const randomPokemons = getRandomElements(filteredResults, 5).map((pokemon) => ({
                ...pokemon,
                name: getJapaneseName(pokemon.name) || pokemon.name,
            }));
            setSearchBars((prev) =>
                prev.map((bar) =>
                    bar.id === id ? { ...bar, result: randomPokemons } : bar
                )
            );
        } catch (error) {
            console.error('エラー:', error);
            alert('エラーが発生しました。再度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    // パーティーにポケモンを追加する関数 (最大6匹まで追加できるように変更)
    const addToParty = (pokemon) => {
        // パーティーには最大6匹まで追加できる
        if (party.length < 6 && !party.some(p => p.id === pokemon.id)) {
            setParty([...party, pokemon]);
        } else if (party.length >= 6) {
            alert('パーティーは最大6匹までです');
        } else {
            alert('このポケモンは既にパーティーに追加されています');
        }
    };

    // 新しい検索バーを追加する関数
    const addSearchBar = () => {
        if (searchBars.length < 5) {
            setSearchBars([
                ...searchBars,
                { id: searchBars.length + 1, pokemonName: '', result: [] },
            ]);
        } else {
            alert('検索バーは最大5つまでです');
        }
    };

    return (
        <div>
            {searchBars.map((bar) => (
                <div key={bar.id}>
                    <form onSubmit={(e) => handleSubmit(e, bar.id, bar.pokemonName)}>
                        <input
                            type="text"
                            value={bar.pokemonName}
                            onChange={(e) =>
                                setSearchBars((prev) =>
                                    prev.map((b) =>
                                        b.id === bar.id
                                            ? { ...b, pokemonName: e.target.value }
                                            : b
                                    )
                                )
                            }
                            placeholder="ポケモン名を入力"
                        />
                        <button type="submit">検索</button>
                    </form>
                    {bar.result.length > 0 && (
                        <div>
                            {bar.result.map((pokemon, index) => {
                                const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                                return (
                                    <div key={pokemon.id || index}>
                                        <img
                                            src={pokemon.official_artwork || spriteUrl}
                                            alt={pokemon.name}
                                            style={{ width: '80px', height: '80px' }}
                                        />
                                        <p>{pokemon.name}</p>
                                        <button onClick={() => addToParty(pokemon)}>
                                            パーティーに追加
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {bar.id < searchBars.length && <hr />}
                </div>
            ))}
            <button onClick={addSearchBar}>検索バーを追加</button>
            {loading && <p>検索中...</p>}
            {notTranslatedPokemons.length > 0 && (
                <div>
                    <h3>日本語名が取得できないポケモン:</h3>
                    <div>
                        {notTranslatedPokemons.map((pokemon, index) => (
                            <div key={pokemon.id || index}>
                                <img
                                    src={pokemon.official_artwork}
                                    alt={pokemon.name}
                                    style={{ width: '80px', height: '80px' }}
                                />
                                <p>{pokemon.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div>
                <h3>パーティー:</h3>
                {party.length > 0 ? (
                    party.map((pokemon, index) => (
                        <div key={index}>
                            <img
                                src={pokemon.official_artwork}
                                alt={pokemon.name}
                                style={{ width: '50px', height: '50px' }}
                            />
                            <p>{pokemon.name}</p>
                        </div>
                    ))
                ) : (
                    <p>パーティーはまだ空です</p>
                )}
            </div>
        </div>
    );
};

export default Home;
