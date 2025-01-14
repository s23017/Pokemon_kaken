"use client";

import React, { useEffect, useState } from "react";
import PokemonData from "../party-builder/data/Pokemon.json"; // JSONファイルを読み込み
import "./pokemonzukan.css";
import Link from "next/link";
import Image from "next/image";

// タイプ名の日本語対応マッピングと画像パス
const typeTranslation = {
    normal: { name: "ノーマル"},
    fire: { name: "ほのお" },
    water: { name: "みず" },
    electric: { name: "でんき"},
    grass: { name: "くさ" },
    ice: { name: "こおり"},
    fighting: { name: "かくとう" },
    poison: { name: "どく" },
    ground: { name: "じめん" },
    flying: { name: "ひこう" },
    psychic: { name: "エスパー" },
    bug: { name: "むし" },
    rock: { name: "いわ" },
    ghost: { name: "ゴースト"},
    dragon: { name: "ドラゴン"},
    dark: { name: "あく"},
    steel: { name: "はがね" },
    fairy: { name: "フェアリー"},
};

const Pokedex = () => {
    const [pokemonList, setPokemonList] = useState([]);
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const formattedPokemonList = PokemonData.map((pokemon) => ({
            id: pokemon.id,
            name: pokemon.name.jpn || pokemon.name.eng,
            artwork: pokemon.official_artwork,
            icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`, // アイコン画像
        }));
        setPokemonList(formattedPokemonList);
    }, []);

    const fetchPokemonDetails = async (pokemon) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch Pokémon details.");
            }
            const data = await response.json();

            const stats = data.stats.reduce((acc, stat) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
            }, {});

            setSelectedPokemon({
                id: pokemon.id,
                name: pokemon.name,
                artwork: pokemon.artwork,
                height: data.height / 10,
                weight: data.weight / 10,
                types: data.types.map((type) => ({
                    name: typeTranslation[type.type.name]?.name || type.type.name,
                })),
                stats: {
                    hp: stats["hp"],
                    attack: stats["attack"],
                    defense: stats["defense"],
                    specialAttack: stats["special-attack"],
                    specialDefense: stats["special-defense"],
                    speed: stats["speed"],
                },
            });
        } catch (error) {
            console.error("Error fetching Pokémon details:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: "120px" }}>
            {/* ヘッダー */}
            <header
                style={{
                    backgroundColor: "#FF0000",
                    color: "white",
                    textAlign: "center",
                    padding: "20px 0",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: "20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                    }}
                >
                    <Link href="/">
                        <Image
                            src="/images/gaming.gif"
                            width={50}
                            height={50}
                            alt="ホームに戻る"
                            style={{ cursor: "pointer" }}
                        />
                    </Link>
                </div>
                <h1 className="header-title">ポケモン図鑑</h1>
            </header>

            <div style={{ marginBottom: "20px", textAlign: "center" }}>
                <input
                    type="text"
                    placeholder="ポケモン名を検索"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: "10px",
                        width: "80%",
                        maxWidth: "400px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                    }}
                />
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                    {loading ? (
                        <p>読み込み中...</p>
                    ) : (
                        <ul
                            style={{
                                listStyle: "none",
                                padding: 0,
                                maxHeight: "500px",
                                overflowY: "auto",
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                padding: "10px",
                            }}
                        >
                            {pokemonList
                                .filter((pokemon) =>
                                    pokemon.name.includes(searchTerm.toLowerCase())
                                )
                                .map((pokemon) => (
                                    <li
                                        key={pokemon.id}
                                        style={{
                                            padding: "10px",
                                            borderBottom: "1px solid #f0f0f0",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                        }}
                                        onClick={() => fetchPokemonDetails(pokemon)}
                                    >
                                        <img
                                            src={pokemon.icon}
                                            alt={pokemon.name}
                                            style={{ width: "40px", height: "40px" }}
                                        />
                                        <span style={{ fontWeight: "bold" }}>
                                    #{pokemon.id.toString().padStart(3, "0")}
                                </span>
                                        <span>{pokemon.name}</span>
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>
                <div style={{ flex: 2 }}>
                    {selectedPokemon ? (
                        <div
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                padding: "20px",
                            }}
                        >
                            <h2>{selectedPokemon.name}</h2>
                            <img
                                src={
                                    selectedPokemon.artwork ||
                                    "https://via.placeholder.com/150"
                                }
                                alt={selectedPokemon.name}
                                style={{ width: "150px", height: "150px" }}
                            />
                            <p>図鑑ナンバー: #{selectedPokemon.id}</p>
                            <p>高さ: {selectedPokemon.height} m</p>
                            <p>重さ: {selectedPokemon.weight} kg</p>
                            <p>タイプ:</p>
                            <div style={{ display: "flex", gap: "10px" }}>
                                {selectedPokemon.types.map((type, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px",
                                        }}
                                    >
                                        <span>{type.name}</span>
                                    </div>
                                ))}
                            </div>
                            <h3>ステータス</h3>
                            <ul>
                                <li>HP: {selectedPokemon.stats.hp}</li>
                                <li>攻撃: {selectedPokemon.stats.attack}</li>
                                <li>防御: {selectedPokemon.stats.defense}</li>
                                <li>特攻: {selectedPokemon.stats.specialAttack}</li>
                                <li>特防: {selectedPokemon.stats.specialDefense}</li>
                                <li>素早さ: {selectedPokemon.stats.speed}</li>
                            </ul>"use client";

                            import React, { useEffect, useState } from "react";
                            import PokemonData from "../party-builder/data/Pokemon.json"; // JSONファイルを読み込み
                            import "./pokemonzukan.css";
                            import Link from "next/link";
                            import Image from "next/image";

                            // タイプ名の日本語対応マッピングと画像パス
                            const typeTranslation = {
                            normal: { name: "ノーマル" },
                            fire: { name: "ほのお" },
                            water: { name: "みず" },
                            electric: { name: "でんき"},
                            grass: { name: "くさ" },
                            ice: { name: "こおり"},
                            fighting: { name: "かくとう" },
                            poison: { name: "どく" },
                            ground: { name: "じめん" },
                            flying: { name: "ひこう" },
                            psychic: { name: "エスパー" },
                            bug: { name: "むし" },
                            rock: { name: "いわ" },
                            ghost: { name: "ゴースト"},
                            dragon: { name: "ドラゴン"},
                            dark: { name: "あく"},
                            steel: { name: "はがね" },
                            fairy: { name: "フェアリー"},
                        };

                            const Pokedex = () => {
                            const [pokemonList, setPokemonList] = useState([]);
                            const [selectedPokemon, setSelectedPokemon] = useState(null);
                            const [loading, setLoading] = useState(false);
                            const [searchTerm, setSearchTerm] = useState("");

                            useEffect(() => {
                            const formattedPokemonList = PokemonData.map((pokemon) => ({
                            id: pokemon.id,
                            name: pokemon.name.jpn || pokemon.name.eng,
                            artwork: pokemon.official_artwork,
                            icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`, // アイコン画像
                        }));
                            setPokemonList(formattedPokemonList);
                        }, []);

                            const fetchPokemonDetails = async (pokemon) => {
                            setLoading(true);
                            try {
                            const response = await fetch(
                            `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
                            );
                            if (!response.ok) {
                            throw new Error("Failed to fetch Pokémon details.");
                        }
                            const data = await response.json();

                            const stats = data.stats.reduce((acc, stat) => {
                            acc[stat.stat.name] = stat.base_stat;
                            return acc;
                        }, {});

                            setSelectedPokemon({
                            id: pokemon.id,
                            name: pokemon.name,
                            artwork: pokemon.artwork,
                            height: data.height / 10,
                            weight: data.weight / 10,
                            types: data.types.map((type) => ({
                            name: typeTranslation[type.type.name]?.name || type.type.name,
                        })),
                            stats: {
                            hp: stats["hp"],
                            attack: stats["attack"],
                            defense: stats["defense"],
                            specialAttack: stats["special-attack"],
                            specialDefense: stats["special-defense"],
                            speed: stats["speed"],
                        },
                        });
                        } catch (error) {
                            console.error("Error fetching Pokémon details:", error);
                        } finally {
                            setLoading(false);
                        }
                        };

                            return (
                            <div style={{ paddingTop: "120px" }}>
                            {/* ヘッダー */}
                            <header
                                style={{
                                    backgroundColor: "#FF0000",
                                    color: "white",
                                    textAlign: "center",
                                    padding: "20px 0",
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    zIndex: 1000,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        left: "20px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                    }}
                                >
                                    <Link href="/">
                                        <Image
                                            src="/images/gaming.gif"
                                            width={50}
                                            height={50}
                                            alt="ホームに戻る"
                                            style={{ cursor: "pointer" }}
                                        />
                                    </Link>
                                </div>
                                <h1 className="header-title">ポケモン図鑑</h1>
                            </header>

                            <div style={{ marginBottom: "20px", textAlign: "center" }}>
                                <input
                                    type="text"
                                    placeholder="ポケモン名を検索"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: "10px",
                                        width: "80%",
                                        maxWidth: "400px",
                                        borderRadius: "5px",
                                        border: "1px solid #ccc",
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "20px" }}>
                                <div style={{ flex: 1 }}>
                                    {loading ? (
                                        <p>読み込み中...</p>
                                    ) : (
                                        <ul
                                            style={{
                                                listStyle: "none",
                                                padding: 0,
                                                maxHeight: "500px",
                                                overflowY: "auto",
                                                border: "1px solid #ddd",
                                                borderRadius: "5px",
                                                padding: "10px",
                                            }}
                                        >
                                            {pokemonList
                                                .filter((pokemon) =>
                                                    pokemon.name.includes(searchTerm.toLowerCase())
                                                )
                                                .map((pokemon) => (
                                                    <li
                                                        key={pokemon.id}
                                                        style={{
                                                            padding: "10px",
                                                            borderBottom: "1px solid #f0f0f0",
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "10px",
                                                        }}
                                                        onClick={() => fetchPokemonDetails(pokemon)}
                                                    >
                                                        <img
                                                            src={pokemon.icon}
                                                            alt={pokemon.name}
                                                            style={{ width: "40px", height: "40px" }}
                                                        />
                                                        <span style={{ fontWeight: "bold" }}>
                                    #{pokemon.id.toString().padStart(3, "0")}
                                </span>
                                                        <span>{pokemon.name}</span>
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </div>
                                <div style={{ flex: 2 }}>
                                    {selectedPokemon ? (
                                        <div
                                            style={{
                                                border: "1px solid #ddd",
                                                borderRadius: "5px",
                                                padding: "20px",
                                            }}
                                        >
                                            <h2>{selectedPokemon.name}</h2>
                                            <img
                                                src={
                                                    selectedPokemon.artwork ||
                                                    "https://via.placeholder.com/150"
                                                }
                                                alt={selectedPokemon.name}
                                                style={{ width: "150px", height: "150px" }}
                                            />
                                            <p>図鑑ナンバー: #{selectedPokemon.id}</p>
                                            <p>高さ: {selectedPokemon.height} m</p>
                                            <p>重さ: {selectedPokemon.weight} kg</p>
                                            <p>タイプ:</p>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                {selectedPokemon.types.map((type, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "5px",
                                                        }}
                                                    >
                                                        <span>{type.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <h3>ステータス</h3>
                                            <ul>
                                                <li>HP: {selectedPokemon.stats.hp}</li>
                                                <li>攻撃: {selectedPokemon.stats.attack}</li>
                                                <li>防御: {selectedPokemon.stats.defense}</li>
                                                <li>特攻: {selectedPokemon.stats.specialAttack}</li>
                                                <li>特防: {selectedPokemon.stats.specialDefense}</li>
                                                <li>素早さ: {selectedPokemon.stats.speed}</li>
                                            </ul>
                                        </div>
                                    ) : (
                                        <p>ポケモンを選択してください。</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                    };

                    export default Pokedex;

                </div>
                    ) : (
                        <p>ポケモンを選択してください。</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pokedex;
