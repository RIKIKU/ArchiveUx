// Node only: reads src/tokens.css (tokens.mjs itself also runs in the gallery).
import { readFileSync } from 'node:fs';
import { looks } from './tokens.mjs';

export function loadTokens(path = new URL('../src/tokens.css', import.meta.url)) {
	return looks(readFileSync(path, 'utf8'));
}
