import type { PageContextMessage } from "@/types";

/**
 * Page context injection script that intercepts XHR requests.
 *
 * This script runs in the MAIN world (page context), not the extension's isolated world.
 *
 * Purpose:
 * - Capture Splitwise user data from XHR response bodies
 *
 * Data Flow:
 * Page Context (this script) → DOM Custom Events → Content Script → Background Worker
 */

// ============================================================================
// XMLHttpRequest Interceptor - Captures Splitwise User Data
// ============================================================================

(() => {
	const OriginalXHR = window.XMLHttpRequest;
	const splitwisePath = "/api/v3.0/get_main_data";
	const splitwiseDomain = "secure.splitwise.com";

	/**
	 * Extended XMLHttpRequest class that intercepts requests and responses.
	 * Captures user data from Splitwise's get_main_data endpoint.
	 */
	window.XMLHttpRequest = class extends OriginalXHR {
		private requestUrl = "";

		/**
		 * Overrides open() to capture the request URL for later inspection.
		 */
		open(
			method: string,
			url: string | URL,
			async = true,
			username: string | null = null,
			password: string | null = null,
		): void {
			this.requestUrl = url.toString();
			super.open(method, url, async, username, password);
		}

		/**
		 * Overrides send() to attach a load listener for capturing response data.
		 */
		send(body?: Document | XMLHttpRequestBodyInit | null): void {
			// Check if this is a Splitwise get_main_data request
			const isSplitwise =
				this.requestUrl.includes(splitwisePath) &&
				// Verify it's either an absolute URL with the domain or a relative URL on the Splitwise domain
				(this.requestUrl.includes(splitwiseDomain) ||
					window.location.hostname === splitwiseDomain);

			if (isSplitwise) {
				// Add listener to capture the response when it arrives
				this.addEventListener("load", () => {
					try {
						if (this.status === 200 && this.responseText) {
							// Parse the JSON response
							const data = JSON.parse(this.responseText) as {
								user: {
									first_name: string;
									last_name: string;
								};
							};

							// Extract user's full name
							const userName = data?.user
								? `${data.user.first_name} ${data.user.last_name}`
								: null;

							if (userName) {
								// Dispatch event to content script with the user name
								const message: PageContextMessage = {
									isTvbMessage: true,
									source: "page-context",
									type: "splitwiseUserName",
									payload: userName,
								};

								const event = new CustomEvent("splitwise-main-data", {
									detail: message,
								});
								document.dispatchEvent(event);
							}
						}
					} catch {
						// Silently ignore JSON parse errors or missing fields
					}
				});
			}

			// Always call the original send to maintain normal behavior
			super.send(body);
		}
	};
})();
