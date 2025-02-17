"use client";
import React, { useEffect, useState } from "react";
import PokemonData from "../party-builder/data/Pokemon.json";
import "./pokemonzukan.css";
import Link from "next/link";
import Image from "next/image";
import { Radar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);
const typeTranslation = {
    normal: { name: "ノーマル" },
    fire: { name: "ほのお" },
    water: { name: "みず" },
    electric: { name: "でんき" },
    grass: { name: "くさ" },
    ice: { name: "こおり" },
    fighting: { name: "かくとう" },
    poison: { name: "どく" },
    ground: { name: "じめん" },
    flying: { name: "ひこう" },
    psychic: { name: "エスパー" },
    bug: { name: "むし" },
    rock: { name: "いわ" },
    ghost: { name: "ゴースト" },
    dragon: { name: "ドラゴン" },
    dark: { name: "あく" },
    steel: { name: "はがね" },
    fairy: { name: "フェアリー" },
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
            icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
        }));
        setPokemonList(formattedPokemonList);
    }, []);
    const fetchPokemonDetails = async (pokemon) => {
        setLoading(true);
        try {
            const pokemonResponse = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
            );
            if (!pokemonResponse.ok) {
                throw new Error(`ポケモンID ${pokemon.id} が見つかりませんでした。`);
            }
            const pokemonData = await pokemonResponse.json();
            const speciesResponse = await fetch(
                `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`
            );
            if (!speciesResponse.ok) {
                throw new Error("Failed to fetch Pokémon species details.");
            }
            const speciesData = await speciesResponse.json();
            const descriptionEntry = speciesData.flavor_text_entries.find(
                (entry) => entry.language.name === "ja"
            );
            const stats = pokemonData.stats.reduce((acc, stat) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
            }, {});
            setSelectedPokemon({
                id: pokemon.id,
                name: pokemon.name,
                artwork: pokemon.artwork,
                height: pokemonData.height / 10,
                weight: pokemonData.weight / 10,
                types: pokemonData.types.map((type) => ({
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
                description: descriptionEntry?.flavor_text || "説明文が見つかりませんでした。",
            });
        } catch (error) {
            console.error("Error fetching Pokémon details:", error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div
            style={{
                backgroundImage: 'url("/images/background.webp")',
                backgroundSize: "auto", // 画像サイズをそのままに
                backgroundRepeat: "repeat", // 繰り返して表示
                backgroundPosition: "top left", // 背景の位置を調整
                minHeight: "100vh",
                padding: "0",
                position: "relative", // 背景画像を親要素に合わせて配置
            }}
        >

            {/* 背景画像を全体に適用 */}
            <div
                style={{
                    backgroundImage: 'url("/images/background.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1, // 背景として表示するため
                }}
            ></div>
            <div style={{paddingTop: "120px"}}>
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
                    }}
                >
                    <Link href="/top">
                        <Image
                            src="/images/gaming.gif"
                            width={50}
                            height={50}
                            alt="ホームに戻る"
                            style={{position: "absolute", left: "20px", cursor: "pointer"}}
                        />
                    </Link>
                    <h1 className="header-title">ポケモン図鑑</h1>
                </header>
                <div style={{textAlign: "center", margin: "20px 0"}}>
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
                <div style={{display: "flex", gap: "20px"}}>
                    <div
                        style={{
                            flex: 1,
                            height: "750px",
                            overflowY: "auto",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            padding: "10px",
                            backgroundColor: "rgba(255, 255, 255, 0.5)",                        }}
                    >
                        {loading ? (
                            <p>読み込み中...</p>
                        ) : (
                            <ul style={{listStyle: "none", padding: 0}}>
                                {pokemonList
                                    .filter((pokemon) =>
                                        pokemon.name.includes(searchTerm.toLowerCase())
                                    )
                                    .map((pokemon) => (
                                        <li
                                            key={pokemon.id}
                                            style={{
                                                padding: "10px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                backgroundColor: "rgba(255, 255, 255, 0.5)",                                            }}
                                            onClick={() => fetchPokemonDetails(pokemon)}
                                        >
                                            <img
                                                src={pokemon.icon}
                                                alt={pokemon.name}
                                                style={{width: "40px", height: "40px"}}
                                            />
                                            <span style={{fontWeight: "bold"}}>
                                            #{pokemon.id.toString().padStart(3, "0")}
                                        </span>
                                            <span>{pokemon.name}</span>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                    <div
                        style={{
                            flex: 3,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",  // 背景を白く
                            padding: "20px",           // 余白を追加
                            borderRadius: "10px",       // 角を丸く
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // 影をつける
                        }}
                    >
                        {selectedPokemon ? (
                            <div style={{display: "flex", justifyContent: "space-between", padding: "10px"}}>
                                <div style={{flex: 1, display: "flex", flexDirection: "column", alignItems: "center"}}>
                                    <img
                                        src={selectedPokemon.artwork || ""}
                                        alt={selectedPokemon.name}
                                        style={{width: "350px", height: "350px", marginBottom: "10px"}}
                                    />
                                    <p style={{
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        color: "#222",
                                        lineHeight: "1.8",
                                        marginBottom: "5px",
                                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)"
                                    }}>
                                        図鑑ナンバー: #{selectedPokemon.id}
                                    </p>
                                    <p style={{
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        color: "#222",
                                        lineHeight: "1.8",
                                        marginBottom: "5px",
                                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)"
                                    }}>
                                        高さ: {selectedPokemon.height} m
                                    </p>
                                    <p style={{
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        color: "#222",
                                        lineHeight: "1.8",
                                        marginBottom: "5px",
                                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)"
                                    }}>
                                        重さ: {selectedPokemon.weight} kg
                                    </p>
                                    <p style={{
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        color: "#222",
                                        lineHeight: "1.8",
                                        marginBottom: "5px",
                                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)"
                                    }}>
                                        タイプ:
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                        {selectedPokemon.types.map((type, index) => (
                                            <p key={index} style={{
                                                fontSize: "18px",
                                                fontWeight: "bold",
                                                color: "#313131",
                                                lineHeight: "1.6",
                                                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)"
                                            }}>
                                                {type.name}
                                            </p>
                                        ))}
                                    </div>
                                    <p style={{     fontSize: "22px",
                                        fontWeight: "bold",
                                        lineHeight: "1.8",
                                        color: "#222",
                                        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                                        padding: "10px",
                                        borderRadius: "10px" }}>{selectedPokemon.description}</p>
                                </div>
                                <div style={{flex: 1}}>
                                    <div style={{flex: 1}}>
                                        <Radar
                                            data={{
                                                labels: ["HP", "攻撃", "防御", "素早さ", "特防", "特攻"], // 素早さと特攻の順番を入れ替え
                                                datasets: [
                                                    {
                                                        label: "ステータス",
                                                        data: [
                                                            selectedPokemon.stats.hp,
                                                            selectedPokemon.stats.attack,
                                                            selectedPokemon.stats.defense,
                                                            selectedPokemon.stats.speed, // 素早さを4番目に
                                                            selectedPokemon.stats.specialDefense,
                                                            selectedPokemon.stats.specialAttack, // 特攻を6番目に
                                                        ],
                                                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                                                        borderColor: "red",
                                                        borderWidth: 1,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                scales: {
                                                    r: {
                                                        beginAtZero: true,
                                                        min: 0,
                                                        max: 150,
                                                        ticks: { stepSize: 50 },
                                                        grid: {
                                                            color: "black",
                                                        },
                                                        angleLines: {
                                                            color: "black",
                                                        },
                                                        pointLabels: {
                                                            color: "black",
                                                            font: { size: 14 },
                                                        },
                                                    },
                                                },
                                                plugins: {
                                                    legend: {
                                                        labels: {
                                                            color: "black",
                                                        },
                                                    },
                                                },
                                            }}
                                        />

                                    </div>

                                </div>
                            </div>
                        ) : (
                            <p>ポケモンを選択してください。</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Pokedex;