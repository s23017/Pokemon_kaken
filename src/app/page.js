import { fetchPokemons } from './api/pokemon';
import PokemonList from './PokemonList'; // クライアントコンポーネントをインポート

const Home = async () => {
    const pokemons = await fetchPokemons(); // サーバーコンポーネントでデータ取得

    return (
        <div>
            <h1>Pokémon List</h1>
            <PokemonList pokemons={pokemons.results} /> {/* クライアントコンポーネントにデータを渡す */}
        </div>
    );
};

export default Home;