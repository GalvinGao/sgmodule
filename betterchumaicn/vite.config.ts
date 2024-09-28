import preact from '@preact/preset-vite';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [UnoCSS(), preact(), viteSingleFile()],
});
