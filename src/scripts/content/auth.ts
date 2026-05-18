/**
 * Authentication management for content script.
 *
 * Captures and stores Splitwise user name from page context XHR interceptor.
 *
 * Data Flow:
 * Page Context (XHR interceptor) → DOM Custom Event → This module → data-service.ts
 */

import type { PageContextMessage } from "@/types";

// ============================================================================
// Token Storage
// ============================================================================

/** Stores the Splitwise user name captured from get_main_data response */
let splitwiseUserName: string | null = null;

/** Track when this module was initialized */
const moduleStartTime = Date.now();

/** Timeout duration in milliseconds */
const TIMEOUT_MS = 5000;

/** Polling interval in milliseconds */
const POLL_INTERVAL_MS = 100;

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

// Listen for Splitwise user data from page context XHR interceptor
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
