"use client";

import React, { useEffect, useState } from "react";

const Pokedex = () => {
    const [pokemonList, setPokemonList] = useState([]);
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchPokemonList = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    "https://pokeapi.co/api/v2/pokemon?limit=10000"
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch Pokémon list.");
                }
                const data = await response.json();
                setPokemonList(data.results);
            } catch (error) {
                console.error("Error fetching Pokémon list:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPokemonList();
    }, []);

    const fetchPokemonDetails = async (pokemon) => {
        setLoading(true);
        try {
            const response = await fetch(pokemon.url);
            if (!response.ok) {
                throw new Error("Failed to fetch Pokémon details.");
            }
            const data = await response.json();

            const speciesResponse = await fetch(
                `https://pokeapi.co/api/v2/pokemon-species/${data.id}`
            );
            if (!speciesResponse.ok) {
                throw new Error("Failed to fetch Pokémon species details.");
            }
            const speciesData = await speciesResponse.json();
            const japaneseNameEntry = speciesData.names.find(
                (nameEntry) => nameEntry.language.name === "ja"
            );

            setSelectedPokemon({
                ...data,
                japaneseName: japaneseNameEntry ? japaneseNameEntry.name : data.name,
            });
        } catch (error) {
            console.error("Error fetching Pokémon details:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1 style={{ textAlign: "center" }}>ポケモン図鑑</h1>
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
                                        key={pokemon.name}
                                        style={{
                                            padding: "10px",
                                            borderBottom: "1px solid #f0f0f0",
                                            cursor: "pointer",
                                            textTransform: "capitalize",
                                        }}
                                        onClick={() => fetchPokemonDetails(pokemon)}
                                    >
                                        {pokemon.name}
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
                            <h2 style={{ textTransform: "capitalize" }}>
                                {selectedPokemon.japaneseName || selectedPokemon.name}
                            </h2>
                            <img
                                src={
                                    selectedPokemon.sprites?.front_default ||
                                    "https://via.placeholder.com/150"
                                }
                                alt={selectedPokemon.name}
                                style={{ width: "150px", height: "150px" }}
                            />
                            <p>高さ: {selectedPokemon.height} m</p>
                            <p>重さ: {selectedPokemon.weight} kg</p>
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
