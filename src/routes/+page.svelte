<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data;

	let answer: string | undefined = data.answer;
	let imageUrl: string | undefined = data.imageUrl; // Pokémon image URL
	let pokemonType: string | undefined = data.pokemonType; // Pokémon type
	import { onMount } from 'svelte';
	import {
		LightSwitch,
		setModeUserPrefers,
		Drawer,
		getDrawerStore,
		type DrawerSettings,
	} from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();
	function openDrawer(): void {
		const drawerSettings: DrawerSettings = {
			id: 'main-drawer', // Unique ID for the drawer
			position: 'right', // Can be 'left', 'right', 'top', or 'bottom'
			bgDrawer: 'bg-surface-900 text-white',
			width: 'w-[280px]', // You can adjust the width as needed
			padding: 'p-4',
			rounded: 'rounded-lg',
		};
		drawerStore.open(drawerSettings);
	}

	let userGuess: string = '';
	let submittedGuess: string = ''; // This will store the last submitted guess
	let attempts: number = 0;
	let hintGiven: boolean = false;
	let feedback: string[] = [];
	let showHintCheckbox: boolean = true;
	let hasWon: boolean = false;
	const maxAttempts: number = 3;
	let answerType: string | null = null;

	// Handle user input and restrict it to alphabetic characters only
	function handleInput(event: Event) {
		const input = (event.target as HTMLInputElement).value;
		// Replace anything that is not a letter (A-Z or a-z)
		userGuess = input.replace(/[^a-zA-Z]/g, '');
	}

	// Handle user input and validate guess
	function checkGuess(): void {
		// If the player has won or lost, do nothing
		if (hasWon || attempts >= maxAttempts) {
			return;
		}

		attempts++;
		feedback = [];
		if (answer) {
			const answerArray = answer.toLowerCase().split('');
			const guessArray = userGuess.toLowerCase().split('');
			const answerUsed = new Array(answer.length).fill(false);

			// First pass: Mark correct letters in the correct position
			for (let i = 0; i < answerArray.length; i++) {
				if (guessArray[i] === answerArray[i]) {
					feedback[i] = 'green';
					answerUsed[i] = true; // Mark this position as used
				}
			}

			// Second pass: Mark remaining letters
			for (let i = 0; i < answerArray.length; i++) {
				if (!feedback[i]) {
					// If letter exists in answer and hasn't been used in the correct position
					const foundIndex = answerArray.findIndex(
						(letter, index) => letter === guessArray[i] && !answerUsed[index],
					);

					if (foundIndex !== -1) {
						feedback[i] = 'yellow'; // Mark as yellow
						answerUsed[foundIndex] = true; // Mark this letter as used
					} else {
						feedback[i] = 'gray'; // Mark as gray
					}
				}
			}

			// Check if the user has guessed the correct answer
			if (feedback.every((f) => f === 'green')) {
				hasWon = true;
			}

			// Update the hidden input to reflect the submitted guess
			submittedGuess = userGuess;
			// Reset the userGuess input field
			userGuess = '';
		}

		// Give a hint after 3 attempts if the checkbox is checked
		if (attempts >= 2 && !hintGiven && showHintCheckbox) {
			hintGiven = true;
			answerType = pokemonType || null; // Use the actual Pokémon type
		}
	}

	// Function to refresh the page
	function tryAgain() {
		window.location.reload();
	}

	onMount(() => {
		const lightSwitchElement = document.querySelector('light-switch');
		if (lightSwitchElement) {
			lightSwitchElement.addEventListener('change', (event: Event) => {
				const customEvent = event as CustomEvent;
				const theme = customEvent.detail.mode; // Accessing CustomEvent details
				setModeUserPrefers(theme === 'dark' ? false : true);
			});
		}
	});
</script>

<div class="fixed top-0 right-0 h-10">
	<div class="m-4">
		<LightSwitch fillDark="fill-surface-800" />
	</div>
</div>
<div class="card w-screen m-auto text-center">
	{#if answer}
		<!-- Only render when answer is available -->
		<div class="flex flex-col items-center justify-center md:min-h-screen">
			<h1 class="text-2xl font-bold mb-4">Guessémon</h1>

			<!-- Pokémon card placeholder with question mark -->
			<div
				class="w-64 h-64 bg-gradient-to-br variant-gradient-error-warning flex items-center justify-center rounded-lg relative"
			>
				{#if hasWon || attempts >= maxAttempts}
					<!-- Show actual Pokémon image after win or game over -->
					<img
						src={imageUrl}
						alt={answer}
						class="absolute inset-0 w-full h-full object-fit rounded-lg"
					/>
				{:else}
					<!-- Show question mark until game ends -->
					<h1 class="text-5xl font-bold text-white">?</h1>
				{/if}
			</div>
			<!-- Dynamically render feedback for each letter in the user's guess -->
			<div
				class="grid mt-6"
				style="grid-template-columns: repeat({answer.length}, 2.5rem);"
			>
				{#each answer.split('') as _, index}
					<div
						class="w-10 h-10 border-2 border-stone-900 dark:border-stone-100 flex items-center justify-center rounded-md text-lg font-semibold
						{feedback[index] === 'green'
							? 'bg-green-400'
							: feedback[index] === 'yellow'
								? 'bg-yellow-400'
								: feedback[index] === 'gray'
									? 'bg-gray-400'
									: ''}"
					>
						<!-- Show current typing guess or last submitted guess if empty -->
						{submittedGuess[index] || userGuess[index] || ''}
					</div>
				{/each}
			</div>

			<!-- Input box for user to type their guess, restricted to alphabetical characters -->
			<input
				type="text"
				bind:value={userGuess}
				on:input={handleInput}
				maxlength={answer.length}
				class="p-2 border rounded w-64 text-center text-xl mt-4 text-stone-800"
				placeholder="Type Your Guess!"
				disabled={hasWon || attempts >= maxAttempts}
			/>

			<!-- Submit  and try again button -->
			<div>
				<button
					class="btn-lg mt-4 px-4 py-2 btn variant-ringed-primary hover:bg-gradient-to-br variant-gradient-primary-secondary text-white font-bold"
					on:click={checkGuess}
					disabled={hasWon || attempts >= maxAttempts}
				>
					Submit Guess
				</button>
				{#if hasWon}
					<button
						class="btn bg-gradient-to-br variant-gradient-primary-tertiary font-semibold mt-4 px-4 py-2 inline"
						on:click={tryAgain}
					>
						Try Again
					</button>
				{:else if attempts >= maxAttempts}
					<button
						class="btn bg-gradient-to-br variant-gradient-primary-tertiary font-semibold mt-4 px-4 py-2 inline"
						on:click={tryAgain}
					>
						Try Again
					</button>
				{/if}
			</div>

			<!-- Checkbox for hint visibility and hint section -->
			<div class="mt-4 p-4 w-3/4 flex justify-between items-center">
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

			<!-- Display "You Win!" or "Game Over" message -->
			{#if hasWon}
				<div class="mt-4 p-4 bg-green-200 text-black rounded">
					<strong>You Win!</strong> The Pokémon was {answer}. You guessed it in {attempts}
					tries.
				</div>
			{:else if attempts >= maxAttempts}
				<div class="mt-4 p-4 bg-red-300 text-black rounded">
					<strong>Game Over!</strong> The Pokémon was {answer}.
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex justify-center items-center h-screen">
			<h1>Loading...</h1>
		</div>
	{/if}
</div>
<div
	class="md:absolute md:right-0 md:top-40 rules-card card bg-stone-300 dark:bg-sky-900 w-full md:w-64 h-64 mt-8"
>
	<div class="text-center">
		<p class="text-xl font-semibold">Current Rules:</p>
		<p>3 Guesses</p>
		<p class:line-through={!showHintCheckbox}>Hint After 2 Fails</p>

		<p class="mt-4 font-semibold">
			Pokemon Filtered Out:
			<button on:click={openDrawer} class="btn bg-transparent m-0 p-0">
				<svg
					class="h-6 w-6"
					viewBox="0 0 24 24"
					fill="#3B82F6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="16" x2="12" y2="12" />
					<line x1="12" y1="8" x2="12.01" y2="8" />
				</svg>
			</button>
		</p>
		<ul>
			<li>Non-Alphabetical</li>
			<li>Less than 5 letters</li>
			<li>More than 10 letters</li>
		</ul>
	</div>
</div>

<Drawer>
	{#if $drawerStore.id === 'main-drawer'}
		<div>
			<p>This is the Drawer content!</p>
			<!-- Add more content inside the drawer as needed -->
		</div>
	{/if}
</Drawer>
<footer
	class="w-full bg-gray-400 dark:bg-gray-800 text-white text-center py-4 md:absolute bottom-0"
>
	<div class="container mx-auto">
		<p>
			Created by Parallax. <a href="https://github.com/parallaxrealms/guessemon"
				><svg
					class="h-6 w-6 mr-2 text-stone-900 dark:text-blue-400 inline"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
					/></svg
				>
			</a>
			Powered by Satori Digital
			<a href="http://www.satoridigital.io">
				<img
					src="/satori-logo.png"
					class="w-8 h-8 mx-1 mb-1 inline"
					alt="satori logo"
				/></a
			>
		</p>
	</div>
</footer>
