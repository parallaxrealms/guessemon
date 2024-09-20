import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	// Preprocess setup including PostCSS (for TailwindCSS)
	preprocess: vitePreprocess({
		// Ensure PostCSS is used for CSS preprocessing
		postcss: true
	}),

	kit: {
		adapter: adapter()
	}
};

export default config;
