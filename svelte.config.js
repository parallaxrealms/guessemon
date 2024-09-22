import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	// Preprocess setup including PostCSS (for TailwindCSS)
	preprocess: vitePreprocess({
		postcss: true
	}),

	kit: {
		adapter: adapter({
			// Any Cloudflare-specific options
			pages: 'dist', // (default) directory to output the built site
			assets: 'public', // (default) directory for static assets
			fallback: null // (optional) if using SPA mode
		})
	}
};

export default config;