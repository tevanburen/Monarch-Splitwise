import { resolve } from "node:path";
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
				format: "es",
			},
		},
	},
	plugins: [react()],
};
