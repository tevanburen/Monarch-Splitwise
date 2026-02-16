/**
 * Authentication token management for content script.
 *
 * Captures and stores authentication tokens from page context:
 * - Listens for custom DOM events dispatched by page fetch interceptor
 * - Stores Monarch auth token and Splitwise user name
 * - Provides getter functions for other modules to access tokens
 *
 * Token Flow:
 * 1. Page context fetch wrapper intercepts API requests
 * 2. Extracts Authorization header and dispatches custom DOM event
 * 3. This module listens for the event and stores the token
 * 4. Data fetcher modules retrieve tokens via getMonarchToken() / getSplitwiseUserName()
 *
 */

import type { PageContextMessage } from "@/types";

// ============================================================================
// Token Storage
// ============================================================================

/** Stores the most recently captured auth token from Monarch API requests */
let monarchAuthToken: string | null = null;

/** Stores the Splitwise user name captured from get_main_data response */
let splitwiseUserName: string | null = null;

/** Track when this module was initialized */
const moduleStartTime = Date.now();

/** Timeout duration in milliseconds */
const TIMEOUT_MS = 5000;

/** Polling interval in milliseconds */
const POLL_INTERVAL_MS = 100;

/**
 * Gets the current Monarch auth token, waiting up to 5 seconds if needed.
 * @returns Promise resolving to the auth token or undefined if not available
 */
export const getMonarchToken = async (): Promise<string | undefined> => {
	// If already available, return immediately
	if (monarchAuthToken) {
		return monarchAuthToken;
	}

	// Wait for token to become available, polling every POLL_INTERVAL_MS
	while (Date.now() - moduleStartTime < TIMEOUT_MS) {
		if (monarchAuthToken) {
			return monarchAuthToken;
		}
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
	}

	// Timeout reached
	return undefined;
};

/**
 * Gets the current Splitwise user name, waiting up to 5 seconds if needed.
 * @returns Promise resolving to the user name or undefined if not available
 */
export const getSplitwiseUserName = async (): Promise<string | undefined> => {
	// If already available, return immediately
	if (splitwiseUserName) {
		return splitwiseUserName;
	}

	// Wait for user name to become available, polling every POLL_INTERVAL_MS
	while (Date.now() - moduleStartTime < TIMEOUT_MS) {
		if (splitwiseUserName) {
			return splitwiseUserName;
		}
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
	}

	// Timeout reached
	return undefined;
};

// ============================================================================
// Event Listeners (auto-initialize)
// ============================================================================

// Listen for auth tokens from page context fetch interceptor
document.addEventListener("monarch-auth-token", ((event: Event) => {
	const customEvent = event as CustomEvent<PageContextMessage>;
	const message = customEvent.detail;

	// Validate message structure before storing
	if (
		message?.isTvbMessage &&
		message?.source === "page-context" &&
		message?.type === "monarchAuthToken"
	) {
		monarchAuthToken = message.payload;
	}
}) as EventListener);

// Listen for Splitwise user data from page context fetch interceptor
document.addEventListener("splitwise-main-data", ((event: Event) => {
	const customEvent = event as CustomEvent<PageContextMessage>;
	const message = customEvent.detail;

	// Validate message structure before storing
	if (
		message?.isTvbMessage &&
		message?.source === "page-context" &&
		message?.type === "splitwiseUserName"
	) {
		splitwiseUserName = message.payload;
	}
}) as EventListener);
