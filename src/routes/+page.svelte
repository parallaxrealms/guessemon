<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data;

	let answer: string | undefined;
	let imageUrl: string | undefined; // Pokémon image URL
	let pokemonType: string | undefined; // Pokémon type
	let filteredOutNames: { name: string; generation: number }[] = [];
	let modeValue: number = data.modeValue; // Initial mode value from the server load
	let userGuesses: string[] = ['', '', '']; // Store guesses for each attempt
	let attempts: number = 0;
	let hintGiven: boolean = false;
	let feedback: string[][] = [[], [], []]; // Store feedback for each attempt
	let showHintCheckbox: boolean = true;
	let hasWon: boolean = false;
	const maxAttempts: number = 3;
	let answerType: string | null = null;
	let filteredNames: { name: string; generation: number }[] = [];

	import { onMount } from 'svelte';
	import {
		LightSwitch,
		setModeUserPrefers,
		RadioGroup,
		RadioItem,
	} from '@skeletonlabs/skeleton';

	function handleInput(event: Event, attemptIndex: number) {
		const input = (event.target as HTMLInputElement).value;
		userGuesses[attemptIndex] = input.replace(/[^a-zA-Z]/g, '');
	}

	async function changeMode(): Promise<void> {
		await filterPokemonByMode();
	}

	async function filterPokemonByMode(): Promise<void> {
		// Adjust filtering logic based on the selected mode
		if (modeValue === 0) {
			// Retro: Gen 1 and Gen 2 only
			filteredNames = filteredOutNames.filter(
				(pokemon) => pokemon.generation <= 2,
			);
		} else if (modeValue === 1) {
			// Ultra: Gen 1 to Gen 6
			filteredNames = filteredOutNames.filter(
				(pokemon) => pokemon.generation <= 6,
			);
		} else {
			// Master: All generations
			filteredNames = filteredOutNames;
		}

		const newAnswer =
			filteredNames[Math.floor(Math.random() * filteredNames.length)];

		if (newAnswer) {
			answer = newAnswer.name;
			await getNewPokemonDetails(answer);
			resetGame();
		} else {
		}
	}

	async function getNewPokemonDetails(pokemonName: string) {
		try {
			const res = await fetch(
				`https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
			);
			const data = await res.json();
			imageUrl = data.sprites.other['official-artwork'].front_default;
			pokemonType = data.types
				.map((typeInfo: any) => typeInfo.type.name)
				.join(', ');
		} catch (error) {
			console.error('Error fetching Pokémon details:', error);
		}
	}

	function resetGame() {
		userGuesses = ['', '', ''];
		attempts = 0;
		hintGiven = false;
		feedback = [[], [], []];
		hasWon = false;
	}

	function checkGuess(): void {
		if (hasWon || attempts >= maxAttempts) {
			return;
		}

		const userGuess = userGuesses[attempts];
		feedback[attempts] = [];

		if (answer) {
			const answerArray = answer.toLowerCase().split('');
			const guessArray = userGuess.toLowerCase().split('');
			const answerUsed = new Array(answer.length).fill(false);

			// First pass: Mark correct letters in the correct position
			for (let i = 0; i < answerArray.length; i++) {
				if (guessArray[i] === answerArray[i]) {
					feedback[attempts][i] = 'green';
					answerUsed[i] = true;
				}
			}

			// Second pass: Mark remaining letters
			for (let i = 0; i < answerArray.length; i++) {
				if (!feedback[attempts][i]) {
					const foundIndex = answerArray.findIndex(
						(letter, index) => letter === guessArray[i] && !answerUsed[index],
					);

					if (foundIndex !== -1) {
						feedback[attempts][i] = 'yellow';
						answerUsed[foundIndex] = true;
					} else {
						feedback[attempts][i] = 'gray';
					}
				}
			}

			if (feedback[attempts].every((f) => f === 'green')) {
				hasWon = true;
			}

			attempts++;
		}

		if (attempts >= 2 && !hintGiven && showHintCheckbox) {
			hintGiven = true;
			answerType = pokemonType || null;
		}
	}

	onMount(async () => {
		try {
			const response = await fetch(
				'https://pokeapi.co/api/v2/pokemon?limit=10000',
			);
			const data = await response.json();

			filteredOutNames = data.results.filter(
				(p: any) =>
					/^[a-zA-Z]+$/.test(p.name) &&
					p.name.length >= 5 &&
					p.name.length <= 10 &&
					!p.name.includes('-'),
			);

			// Fetch generation info for filtered Pokémon
			const pokemonWithGenerations = await Promise.all(
				filteredOutNames.map(async (pokemon: any) => {
					const speciesResponse = await fetch(
						pokemon.url.replace('/pokemon/', '/pokemon-species/'),
					);
					const speciesData = await speciesResponse.json();
					const generationNumber = parseInt(
						speciesData.generation.url.split('/').slice(-2, -1)[0],
					);
					return { name: pokemon.name, generation: generationNumber };
				}),
			);
			filteredOutNames = pokemonWithGenerations;

			// Set initial answer and fetch details
			if (answer) {
				await getNewPokemonDetails(answer);
			} else {
				await filterPokemonByMode();
			}
		} catch (error) {
			console.error('Error fetching Pokémon list:', error);
		}

		const lightSwitchElement = document.querySelector('light-switch');
		if (lightSwitchElement) {
			lightSwitchElement.addEventListener('change', (event: Event) => {
				const customEvent = event as CustomEvent;
				const theme = customEvent.detail.mode;
				setModeUserPrefers(theme === 'dark' ? false : true);
			});
		}
	});

	$: modeValue, changeMode();
</script>

<div class="fixed top-0 right-0 h-10">
	<div class="m-4">
		<LightSwitch fillDark="fill-surface-800" />
	</div>
</div>

<div class="card w-screen m-auto text-center">
	{#if answer}
		<div class="flex flex-col items-center justify-center md:min-h-screen">
			<h1 class="text-2xl font-bold mb-2">Guessémon</h1>
			<div
				class="w-64 h-64 bg-gradient-to-br variant-gradient-error-warning flex items-center justify-center rounded-lg relative"
			>
				{#if hasWon || attempts >= maxAttempts}
					<img
						src={imageUrl}
						alt={answer}
						class="absolute inset-0 w-full h-full object-fit rounded-lg"
					/>
				{:else}
					<h1 class="h1 font-bold text-white text-9xl">?</h1>
				{/if}
			</div>

			<div
				class="letter-boxes grid"
				style="grid-template-columns: repeat({answer.length}, 2.5rem);"
			>
				{#each answer.split('') as _, index}
					<div
						class="w-10 h-10 border-2 border-stone-900 dark:border-stone-100 flex items-center justify-center rounded-md text-lg font-semibold
						{feedback[0][index] === 'green'
							? 'bg-green-400'
							: feedback[0][index] === 'yellow'
								? 'bg-yellow-400'
								: feedback[0][index] === 'gray'
									? 'bg-gray-400'
									: ''}"
					>
						{userGuesses[0][index] || ''}
					</div>
				{/each}
			</div>

			{#if attempts > 0}
				<div
					class="letter-boxes grid"
					style="grid-template-columns: repeat({answer.length}, 2.5rem);"
				>
					{#each answer.split('') as _, index}
						<div
							class="w-10 h-10 border-2 border-stone-900 dark:border-stone-100 flex items-center justify-center rounded-md text-lg font-semibold
						{feedback[1][index] === 'green'
								? 'bg-green-400'
								: feedback[1][index] === 'yellow'
									? 'bg-yellow-400'
									: feedback[1][index] === 'gray'
										? 'bg-gray-400'
										: ''}"
						>
							{userGuesses[1][index] || ''}
						</div>
					{/each}
				</div>
			{/if}

			{#if attempts > 1}
				<div
					class="letter-boxes grid"
					style="grid-template-columns: repeat({answer.length}, 2.5rem);"
				>
					{#each answer.split('') as _, index}
						<div
							class="w-10 h-10 border-2 border-stone-900 dark:border-stone-100 flex items-center justify-center rounded-md text-lg font-semibold
						{feedback[2][index] === 'green'
								? 'bg-green-400'
								: feedback[2][index] === 'yellow'
									? 'bg-yellow-400'
									: feedback[2][index] === 'gray'
										? 'bg-gray-400'
										: ''}"
						>
							{userGuesses[2][index] || ''}
						</div>
					{/each}
				</div>
			{/if}

			<input
				type="text"
				bind:value={userGuesses[attempts]}
				on:input={(event) => handleInput(event, attempts)}
				maxlength={answer.length}
				class="p-2 border rounded w-64 text-center text-xl mt-4 text-stone-800"
				placeholder="Type Your Guess!"
				disabled={hasWon || attempts >= maxAttempts}
			/>

			<div>
				<button
					class="btn-lg mt-4 px-4 py-1 btn variant-ringed-primary hover:bg-gradient-to-br variant-gradient-primary-secondary text-white font-bold"
					on:click={checkGuess}
					disabled={hasWon ||
						attempts >= maxAttempts ||
						userGuesses[attempts].length !== answer.length}
				>
					Submit Guess
				</button>
				{#if hasWon}
					<button
						class="btn bg-gradient-to-br variant-gradient-primary-tertiary font-semibold mt-4 px-4 py-1 inline"
						on:click={resetGame}
					>
						Try Again
					</button>
				{:else if attempts >= maxAttempts}
					<button
						class="btn bg-gradient-to-br variant-gradient-primary-tertiary font-semibold mt-4 px-4 py-1 inline"
						on:click={resetGame}
					>
						Try Again
					</button>
				{/if}
			</div>

			<div class="p-2 w-3/4 flex justify-between items-center">
				<div class="flex items-center">
					<input
						id="showHint"
						type="checkbox"
						bind:checked={showHintCheckbox}
						class="mr-2"
					/>
					<label for="showHint">Show Hint after 2 Fails</label>
				</div>
				<div class="text-right">
					{#if hintGiven}
						<strong>Hint:</strong> The Pokémon type is {answerType}.
					{:else}
						<div style="width: 150px;"></div>
					{/if}
				</div>
			</div>

			{#if hasWon}
				<div class="mt-4 p-4 bg-green-200 text-black rounded z-50">
					<strong>You Win!</strong> The Pokémon was {answer}. You guessed it in {attempts}
					tries.
				</div>
			{:else if attempts >= maxAttempts}
				<div class="mt-4 p-4 bg-red-300 text-black rounded z-50">
					<strong>Game Over!</strong> The Pokémon was {answer}.
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex justify-center items-center h-screen">
			<h1 class="h1">
				<span
					class="bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone"
					>Loading...</span
				>
			</h1>
		</div>
	{/if}
</div>

<div
	class="md:absolute md:left-0 md:top-40 modes-card w-full md:w-64 h-64 mt-8"
>
	<div class="text-center">
		<p class="text-xl font-semibold">Choose your League:</p>
		<div class="my-4">
			<RadioGroup
				display="flex"
				class="w-full h-fit bg-surface-200-700-token"
				rounded="rounded-container-token"
				flexDirection="flex-col"
				active="text-white bg-gradient-to-br variant-gradient-tertiary-secondary"
				hover="text-white bg-surface-400"
				on:change={() => changeMode()}
			>
				<RadioItem
					bind:group={modeValue}
					name="retro"
					value={0}
					class="flex justify-between items-center px-4 py-2"
				>
					<div class="flex justify-between w-full">
						<span class="font-bold text-sky-300">Retro</span>
						<span class="text-right">Easy</span>
					</div>
				</RadioItem>
				<RadioItem
					bind:group={modeValue}
					name="common"
					value={1}
					class="flex justify-between items-center px-4 py-2"
				>
					<div class="flex justify-between w-full">
						<span class="font-bold text-yellow-300">Common</span>
						<span class="text-right">Hard</span>
					</div>
				</RadioItem>
				<RadioItem
					bind:group={modeValue}
					name="master"
					value={2}
					class="flex justify-between items-center px-4 py-2"
				>
					<div class="flex justify-between w-full">
						<span class="font-bold text-red-300">Master</span>
						<span class="text-right">Very Hard</span>
					</div>
				</RadioItem>
			</RadioGroup>
		</div>
		<div>
			<p>Pokemon chosen from:</p>
			{#if modeValue == 0}
				<p>Generations 1 + 2</p>
			{:else if modeValue == 1}
				<p>Generations 1 - 6</p>
			{:else if modeValue == 2}
				<p>Any generation</p>
			{/if}
		</div>
	</div>
</div>

<div
	class="md:absolute md:right-0 md:top-40 rules-card card bg-stone-300 dark:bg-sky-900 w-full md:w-64 h-64 mt-8"
>
	<div class="text-center">
		<p class="text-xl font-semibold">Current Rules:</p>
		<p>3 Guesses</p>
		<p class:line-through={!showHintCheckbox}>Hint After 2 Fails</p>

		<p class="mt-4 font-semibold">Pokemon Filtered Out:</p>
		<ul>
			<li>Non-Alphabetical</li>
			<li>Less than 5 letters</li>
			<li>More than 10 letters</li>
			{#if modeValue == 0}
				<li>Introduced after Generation 2</li>
			{:else if modeValue == 1}
				<li>Introduced after Generation 6</li>
			{/if}
		</ul>
	</div>
</div>

<footer
	class="w-full bg-gray-300 dark:bg-gray-800 text-white text-center py-4 md:absolute bottom-0"
>
	<div class="container mx-auto">
		<p class="text-gray-800 dark:text-gray-200">
			<span class="mr-2"
				>Developed by Parallax
				<a href="https://github.com/parallaxrealms/guessemon">
					<svg
						class="h-6 w-6 mx-2 text-blue-500 dark:text-blue-400 inline"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
						/>
					</svg>
				</a>
			</span>
			<span class="ml-2"
				>Powered by Satori Digital
				<a href="http://www.satoridigital.io">
					<img
						src="/satori-logo.png"
						class="w-8 h-8 mx-1 mb-1 inline"
						alt="satori logo"
					/>
				</a>
			</span>
		</p>
	</div>
</footer>
