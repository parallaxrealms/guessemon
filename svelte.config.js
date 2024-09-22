import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	// Preprocess setup including PostCSS (for TailwindCSS)
	preprocess: vitePreprocess({
		postcss: true
	}),

	kit: {
		adapter: adapter({

		})
	}
};

export default config;
