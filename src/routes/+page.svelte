<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data;

	let answer: string | undefined = data.answer;
	import { LightSwitch, setModeUserPrefers } from '@skeletonlabs/skeleton';

	import { onMount } from 'svelte';

	let userGuess: string = '';
	let attempts: number = 0;
	let hintGiven: boolean = false;
	let feedback: string[] = [];
	let showHintCheckbox: boolean = false;

	const maxAttempts: number = 5;
	let answerType: string | null = null;

	// Handle user input and validate guess
	function checkGuess(): void {
		attempts++;
		feedback = [];
		if (answer) {
			for (let i = 0; i < answer.length; i++) {
				if (userGuess[i] === answer[i]) {
					feedback.push('green');
				} else if (answer.includes(userGuess[i])) {
					feedback.push('yellow');
				} else {
					feedback.push('red');
				}
			}
		}

		// Give a hint after 3 attempts if the checkbox is checked
		if (attempts >= 3 && !hintGiven && showHintCheckbox) {
			hintGiven = true;
			answerType = 'Electric'; // Example static type hint
		}
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
<div class="card h-screen m-auto text-center">
	{#if answer}
		<!-- Only render when answer is available -->
		<div class="flex flex-col items-center justify-center min-h-screen">
			<h1 class="text-2xl font-bold mb-4">Guessémon</h1>

			<!-- Dynamically render feedback for each letter in the user's guess -->
			<div
				class="grid"
				style="grid-template-columns: repeat({answer.length}, 2.5rem); gap: 0.5rem;"
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

			<!-- Input box for user to type their guess -->
			<input
				type="text"
				bind:value={userGuess}
				maxlength={answer.length}
				class="p-2 border rounded w-64 text-center text-xl mt-4 text-stone-800"
				placeholder="Type Your Guess!"
			/>

			<!-- Submit button -->
			<button
				class="btn-lg mt-4 px-4 py-2 btn variant-ringed-primary hover:bg-gradient-to-br variant-gradient-primary-secondary text-white font-bold"
				on:click={checkGuess}
			>
				Submit Guess
			</button>

			<!-- Checkbox for hint visibility and hint section -->
			<div class="mt-4 p-4 w-1/2 flex justify-between items-center">
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

			{#if attempts >= maxAttempts}
				<div class="mt-4 p-4 bg-red-200 text-black rounded">
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
