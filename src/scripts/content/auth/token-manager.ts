/**
 * Manages auth tokens captured from page context.
 *
 * Stores authentication tokens that are intercepted from API requests
 * made by the host page. These tokens are used to make authenticated
 * API calls to Monarch and Splitwise.
 */

/** Stores the most recently captured auth token from Monarch API requests */
let monarchAuthToken: string | null = null;

/** Stores the Splitwise user name captured from get_main_data response */
let splitwiseUserName: string | null = null;

/**
 * Gets the current Monarch auth token.
 * @returns The auth token or null if not yet captured
 */
export const getMonarchToken = (): string | null => monarchAuthToken;

/**
 * Sets the Monarch auth token.
 * @param token - The authorization token to store
 */
export const setMonarchToken = (token: string): void => {
	monarchAuthToken = token;
};

/**
 * Gets the current Splitwise user name.
 * @returns The user name or null if not yet captured
 */
export const getSplitwiseUserName = (): string | null => splitwiseUserName;

/**
 * Sets the Splitwise user name.
 * @param name - The user name to store
 */
export const setSplitwiseUserName = (name: string): void => {
	splitwiseUserName = name;
};
