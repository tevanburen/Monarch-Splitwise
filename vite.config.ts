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
		cssCodeSplit: false,
		rollupOptions: {
			input: {
				app: "./src/index.tsx",
				"page-context-injection": "./src/api/page-context-injection.ts",
			},
			output: {
				entryFileNames: "[name].js",
				assetFileNames: (assetInfo: { name?: string }) => {
					if (assetInfo.name?.endsWith(".css")) {
						return "app.css";
					}
					return "[name].[ext]";
				},
				format: "es",
			},
		},
	},
	plugins: [react(), tailwindcss()],
};
