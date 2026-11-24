// The gallery (docs/design-system.md, "Gallery"): `npm run gallery` serves it,
// `npm run build:gallery` builds it into dist-gallery for GitHub Pages. Two
// pages: index.html (tokens, pairings, samples) and frame.html (the frame,
// 0.3.0).
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
		rollupOptions: { input: { index: page('index.html'), frame: page('frame.html') } }
	}
});
