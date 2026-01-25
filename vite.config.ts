import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default {
	root: "./src",
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
			},
			output: {
				entryFileNames: "[name].js",
				assetFileNames: "[name].[ext]",
				format: "es",
			},
		},
		cssCodeSplit: false, // Bundle all CSS into one file
	},
	plugins: [react(), tailwindcss()],
};
