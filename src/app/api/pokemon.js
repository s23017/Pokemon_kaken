export async function fetchPokemons() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10'); // 例: 最初の10体を取得
    if (!response.ok) {
        throw new Error('Failed to fetch');
    }
    return response.json();
}