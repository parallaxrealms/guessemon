<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data;

	let answer: string | undefined = data.answer;
	let imageUrl: string | undefined = data.imageUrl; // Pokémon image URL
	let pokemonType: string | undefined = data.pokemonType; // Pokémon type
	import { LightSwitch, setModeUserPrefers } from '@skeletonlabs/skeleton';

	import { onMount } from 'svelte';

	let userGuess: string = '';
	let attempts: number = 0;
	let hintGiven: boolean = false;
	let feedback: string[] = [];
	let showHintCheckbox: boolean = true;
	let hasWon: boolean = false;
	const maxAttempts: number = 5;
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
			let correctCount = 0;
			for (let i = 0; i < answer.length; i++) {
				if (userGuess[i] === answer[i]) {
					feedback.push('green');
					correctCount++;
				} else if (answer.includes(userGuess[i])) {
					feedback.push('yellow');
				} else {
					feedback.push('red');
				}
			}

			// Check if the user has guessed the correct answer
			if (correctCount === answer.length) {
				hasWon = true;
			}
		}

		// Give a hint after 3 attempts if the checkbox is checked
		if (attempts >= 3 && !hintGiven && showHintCheckbox) {
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
<div class="card w-screen h-screen m-auto text-center">
	{#if answer}
		<!-- Only render when answer is available -->
		<div class="flex flex-col items-center justify-center min-h-screen">
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
								: feedback[index] === 'red'
									? 'bg-red-400'
									: ''}"
					>
						{userGuess[index] || ''}
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

			<!-- Submit button -->
			<button
				class="btn-lg mt-4 px-4 py-2 btn variant-ringed-primary hover:bg-gradient-to-br variant-gradient-primary-secondary text-white font-bold"
				on:click={checkGuess}
				disabled={hasWon || attempts >= maxAttempts}
			>
				Submit Guess
			</button>

			<!-- Checkbox for hint visibility and hint section -->
			<div class="mt-4 p-4 w-3/4 flex justify-between items-center">
				<div class="flex items-center">
					<input
						id="showHint"
						type="checkbox"
						bind:checked={showHintCheckbox}
						class="mr-2"
					/>
					<label for="showHint">Show Hint after 3 Fails</label>
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
				<button
					class="btn bg-gradient-to-br variant-gradient-primary-tertiary font-semibold mt-4 px-4 py-2"
					on:click={tryAgain}
				>
					Try Again
				</button>
			{:else if attempts >= maxAttempts}
				<div class="mt-4 p-4 bg-red-300 text-black rounded">
					<strong>Game Over!</strong> The Pokémon was {answer}.
				</div>
				<button
					class="btn bg-gradient-to-br variant-gradient-primary-tertiary font-semibold mt-4 px-4 py-2"
					on:click={tryAgain}
				>
					Try Again
				</button>
			{/if}
		</div>
	{:else}
		<div class="flex justify-center items-center h-screen">
			<h1>Loading...</h1>
		</div>
	{/if}
</div>
