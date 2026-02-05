import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default {
	root: "./src",
	base: "./",
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	build: {
		outDir: resolve(__dirname, "./dist"),
		emptyOutDir: true,
		rollupOptions: {
			input: {
				"inject-ui": "./src/scripts/content/inject-ui.ts",
				"fetch-interceptor": "./src/scripts/page/fetch-interceptor.ts",
				background: "./src/scripts/background/index.ts",
				ui: "./src/ui.html",
			},
			output: {
				entryFileNames: "[name].js",
				assetFileNames: "[name].[ext]",
				format: "es",
			},
		},
	},
	plugins: [react(), tailwindcss()],
};
