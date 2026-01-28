import type { PageContextMessage } from "@/types";

/**
 * Page context injection script that intercepts fetch requests to capture auth tokens.
 * This script runs in the page context (not extension context) to access the original fetch API.
 * Wraps window.fetch to extract Authorization headers from Monarch API requests.
 */

// add a fetch wrapper
(() => {
	const originalFetch = window.fetch;
	window.fetch = async (...args) => {
		const [target, init] = args;

		const targetUrl = "api.monarch.com";

		if (
			(target as URL)?.href?.includes(targetUrl) ||
			(target as Request)?.url?.includes(targetUrl) ||
			(target as string)?.includes(targetUrl)
		) {
			const headers =
				init?.headers instanceof Headers
					? Object.fromEntries(init.headers.entries())
					: (init?.headers as Record<string, string>) || {};

			const token = headers.Authorization || headers.authorization;
			if (token) {
				window.postMessage({
					isTvbMessage: true,
					source: "page-context",
					type: "authToken",
					payload: token,
				} satisfies PageContextMessage);
			}
		}

		return originalFetch(...args);
	};
})();
