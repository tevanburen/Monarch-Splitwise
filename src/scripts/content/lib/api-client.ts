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
	/**
	 * Executes an API call with the provided parameters.
	 *
	 * @param params Configuration for the API call
	 * @returns Promise resolving to the API response
	 * @throws Error if the API call fails
	 */
	makeCall(params: unknown): Promise<unknown>;
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
 * Used for debugging purposes via PRINT_AUTH_TOKEN_MESSAGE from background.
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
	/**
	 * Executes an API call to an external service.
	 * Currently a stub - to be implemented with actual API logic.
	 *
	 * @param params API call configuration (endpoint, method, body, etc.)
	 * @throws Error indicating that the API client is not yet implemented
	 */
	const makeCall = async (params: unknown): Promise<unknown> => {
		// TODO: Implement API call logic
		// authToken will be available here for authenticated requests
		console.warn("TODO: API client not yet implemented", params);
		throw new Error("API client not implemented");
	};

	return {
		makeCall,
	};
};
