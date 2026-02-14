/**
 * Listeners for auth token events from page context.
 *
 * Sets up DOM event listeners that capture authentication tokens
 * from custom events dispatched by the page context fetch interceptor.
 *
 * Token Flow:
 * 1. Page context fetch wrapper intercepts API requests
 * 2. Extracts Authorization header and dispatches custom DOM event
 * 3. This module listens for the event and stores the token via token-manager
 */

import type { PageContextMessage } from "@/types";
import * as tokenManager from "./token-manager";

/**
 * Initializes the listener for auth token events from page context.
 * Should be called once during content script initialization.
 *
 * Listens for 'monarch-auth-token' and 'splitwise-main-data' custom DOM events.
 */
export const initAuthTokenListener = (): void => {
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
			tokenManager.setMonarchToken(message.payload);
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
			tokenManager.setSplitwiseUserName(message.payload);
		}
	}) as EventListener);
};
