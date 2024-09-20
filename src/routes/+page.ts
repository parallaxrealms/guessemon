import type { PageLoad } from './$types';

const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=10000';
const filteredPokemon = (pokemonList: any) => pokemonList.filter((p: any) => p.name.length >= 5 && p.name.length <= 10);

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch(apiUrl);
  const data = await response.json();

  const pokemonList = filteredPokemon(data.results);
  const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)].name;

  return {
    answer: randomPokemon
  };
};
