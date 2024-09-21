import type { PageLoad } from './$types';

const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=10000';

// Filter out Pokémon with non-alphabetical characters in their names
const filteredPokemon = (pokemonList: any) => {
  return pokemonList.filter((p: any) => /^[a-zA-Z]+$/.test(p.name) && p.name.length >= 5 && p.name.length <= 10);
};

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch(apiUrl);
  const data = await response.json();

  const pokemonList = filteredPokemon(data.results);
  const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];

  const pokemonDetailsResponse = await fetch(randomPokemon.url);
  const pokemonDetails = await pokemonDetailsResponse.json();

  const types = pokemonDetails.types.map((typeInfo: any) => typeInfo.type.name).join(', ');

  console.log(randomPokemon.name);
  return {
    answer: randomPokemon.name,
    imageUrl: pokemonDetails.sprites.other['official-artwork'].front_default,
    pokemonType: types,
  };
};
