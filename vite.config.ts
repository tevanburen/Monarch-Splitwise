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
				"outer-root": "./src/outer-root.tsx",
				"page-context-injection": "./src/api/page-context-injection.ts",
				"inner-root": "./src/inner-root.html",
				background: "./src/background.ts",
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
