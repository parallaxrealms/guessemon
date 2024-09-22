import type { PageLoad } from './$types';

const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=10000';

// Filter out Pokémon with non-alphabetical characters or special forms (forms typically contain hyphens)
const filteredPokemon = (pokemonList: any) => {
  return pokemonList.filter(
    (p: any) =>
      /^[a-zA-Z]+$/.test(p.name) &&
      p.name.length >= 5 &&
      p.name.length <= 10 &&
      !p.name.includes('-')
  );
};

// Fetch the generation of each Pokémon species (excluding forms)
const getPokemonGeneration = async (
  pokemon: any,
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
): Promise<number | null> => {
  try {
    const speciesResponse = await fetch(pokemon.url.replace('/pokemon/', '/pokemon-species/'));
    if (!speciesResponse.ok) {
      console.warn(`Species data not found for ${pokemon.name}: ${speciesResponse.statusText}`);
      return null;
    }

    const speciesData = await speciesResponse.json();
    const generationUrl = speciesData.generation.url;
    const generationNumber = parseInt(generationUrl.split('/').slice(-2, -1)[0]);

    return generationNumber;
  } catch (error) {
    console.error(`Failed to fetch generation for ${pokemon.name}:`, error);
    return null;
  }
};

// Filter Pokémon based on the selected mode (Retro, Ultra, Master)
const filterPokemonByMode = (pokemonList: { name: string; generation: number }[], modeValue: number) => {
  if (modeValue === 0) {
    return pokemonList.filter((pokemon) => pokemon.generation <= 2); // Retro (Gen 1 & 2)
  } else if (modeValue === 1) {
    return pokemonList.filter((pokemon) => pokemon.generation <= 6); // Ultra (Gen 1 - 6)
  } else {
    return pokemonList; // Master (All generations)
  }
};

export const load: PageLoad = async ({ fetch, url }) => {
  const modeValue = parseInt(url.searchParams.get('mode') || '0'); // Get modeValue from URL params

  const response = await fetch(apiUrl);
  const data = await response.json();

  // Get filtered Pokémon
  const pokemonFilteredOut = filteredPokemon(data.results);

  // Get generation information for filtered Pokémon
  const pokemonWithGenerations: { name: string; generation: number }[] = (
    await Promise.all(
      pokemonFilteredOut.map(async (pokemon: any) => {
        const generation = await getPokemonGeneration(pokemon, fetch);
        if (generation !== null) {
          return { name: pokemon.name, generation };
        } else {
          return null;
        }
      })
    )
  ).filter((pokemon) => pokemon !== null) as { name: string; generation: number }[];

  // Filter based on the selected mode (Retro, Ultra, Master)
  const filteredPokemonList = filterPokemonByMode(pokemonWithGenerations, modeValue);
  const randomPokemon = filteredPokemonList[Math.floor(Math.random() * filteredPokemonList.length)];

  const pokemonDetailsResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomPokemon.name}`);
  const pokemonDetails = await pokemonDetailsResponse.json();

  const types = pokemonDetails.types.map((typeInfo: any) => typeInfo.type.name).join(', ');

  return {
    answer: randomPokemon.name,
    imageUrl: pokemonDetails.sprites.other['official-artwork'].front_default,
    pokemonType: types,
    filteredOutNames: pokemonWithGenerations,
    modeValue,
  };
};
