import type { PageContextMessage } from "./api.types";

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

			if (headers["Authorization"] || headers["authorization"]) {
				const token = headers["Authorization"] || headers["authorization"];
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
