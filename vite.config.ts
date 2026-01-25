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
				app: "./src/index.tsx",
				"page-context-injection": "./src/api/page-context-injection.ts",
				iframe: "./src/iframe.html",
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
