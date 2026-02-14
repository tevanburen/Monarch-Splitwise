/**
 * API client for making authenticated requests to external services.
 * Captures and uses auth tokens intercepted from the page context.
 *
 * This module has two responsibilities:
 * 1. Capture auth tokens from page context fetch interceptor
 * 2. Use the token to make API calls to external services
 *
 * Token Flow:
 * 1. Page context fetch wrapper intercepts Monarch API requests
 * 2. Extracts Authorization header and dispatches custom DOM event
 * 3. This module listens for the event and stores the token
 * 4. Token is used in API calls to Monarch, Splitwise, or other services
 *
 * The background worker can request API calls through chrome.runtime.sendMessage,
 * and this client will execute them using the content script's network access.
 *
 * TODO: Implement API call functionality
 * - Handle different API endpoints (Monarch, Splitwise)
 * - Parse and return responses to background worker
 * - Handle errors and retries
 * - Support different HTTP methods (GET, POST, etc.)
 * - Handle request/response serialization
 */

/** Stores the most recently captured auth token from Monarch API requests */
let authToken: string | null = null;

/**
 * Interface for API client operations.
 */
export interface ApiClient {
	fetchSplitwiseRows(accountIds: string[]): Promise<Record<string, unknown[]>>;
}

/**
 * Initializes the listener for auth token events from page context.
 * Should be called once during content script initialization.
 *
 * Listens for 'monarch-auth-token' custom DOM events that contain
 * the Authorization header from Monarch API requests.
 */
export const initAuthTokenListener = () => {
	// Listen for auth tokens from page context fetch interceptor
	document.addEventListener("monarch-auth-token", ((event: Event) => {
		const customEvent = event as CustomEvent;
		const message = customEvent.detail;

		// Validate message structure before storing
		if (
			message?.isTvbMessage &&
			message?.source === "page-context" &&
			message?.type === "authToken"
		) {
			authToken = message.payload;
		}
	}) as EventListener);
};

/**
 * Logs the current auth token to the console.
 */
export const printAuthToken = () => {
	console.log("Current auth token:", authToken);
};

/**
 * Creates and returns an API client instance.
 *
 * @returns ApiClient instance for making API requests
 */
export const createApiClient = (): ApiClient => {
	const fetchSplitwiseRows = async (
		accountIds: string[],
	): Promise<Record<string, unknown[]>> => {
		// TODO: Implement API call logic
		// Wait 10 seconds for testing
		await new Promise((resolve) => setTimeout(resolve, 10000));
		return accountIds.reduce(
			(acc, accountId) => {
				acc[accountId] = ["row1", "row2", "row3"];
				return acc;
			},
			{} as Record<string, unknown[]>,
		);
	};

	return {
		fetchSplitwiseRows,
	};
};
