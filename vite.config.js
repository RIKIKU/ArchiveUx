// The gallery (docs/design-system.md, "Gallery"): `npm run gallery` serves it,
// `npm run build:gallery` builds it into dist-gallery for GitHub Pages. Four
// pages: index.html (tokens, pairings, samples), frame.html (the frame,
// 0.3.0), search.html (DateRange with and without times, and Suggest, 0.4.0)
// and admin.html (state badges, banners, DataTable, Confirm, MoreActions, 0.5.0).
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

const page = (p) => fileURLToPath(new URL(`./gallery/${p}`, import.meta.url));

export default defineConfig({
	root: 'gallery',
	base: './',
	plugins: [svelte()],
	server: { port: 5173, strictPort: false },
	build: {
		outDir: '../dist-gallery',
		emptyOutDir: true,
		rollupOptions: { input: { index: page('index.html'), frame: page('frame.html'), search: page('search.html'), admin: page('admin.html') } }
	}
});
