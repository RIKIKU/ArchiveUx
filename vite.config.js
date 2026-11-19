// The gallery (docs/design-system.md, "Gallery"): `npm run gallery` serves it,
// `npm run build:gallery` builds it into dist-gallery for GitHub Pages.
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	root: 'gallery',
	base: './',
	plugins: [svelte()],
	server: { port: 5173, strictPort: false },
	build: { outDir: '../dist-gallery', emptyOutDir: true }
});
