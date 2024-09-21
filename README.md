## Guessemon
# Wordle meets Pokemon
Created by Parallax

# About
A fun little game I made using Sveltekit. On page load it fetches a random pokemon from PokéAPI:  https://pokeapi.co/ and sets it's name as the answer to the word puzzle. It's element type(s) are also fetched for the Hint, and the official Card Art.
To avoid long names we also filter out any pokemon names with less than 5 characters or more than 10 characters. We also filter out pokemon with any dashes, spaces or other non-alphabetical letters in their name. So Pokémon such as Abra, Ho-oh or Porygon-z are all excluded.
