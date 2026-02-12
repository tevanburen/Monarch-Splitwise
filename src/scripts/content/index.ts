/**
 * Content script entry point and orchestrator.
 *
 * This is the main content script that runs in the context of the web page.
 * It orchestrates all sub-modules and handles communication with the background worker.
 *
 * Responsibilities:
 * 1. Initialize all managers (iframe, state, auth, etc.)
 * 2. Set up listeners for background worker messages
 * 3. Route messages to appropriate modules
 * 4. Coordinate between different components
 *
 * Message Flow:
 * - Background Worker → Content Script → Sub-modules (auth, iframe, api, etc.)
 * - Page Context → Content Script (via DOM events for auth tokens)
 * - Content Script → Background Worker (async responses via sendResponse)
 */

import type {
	BackgroundState,
	PrintAuthTokenMessage,
	SplitwiseRowRequestMessage,
	SplitwiseRowResponseMessage,
	UpdateStateBroadcastMessage,
} from "@/types";
import {
	createApiClient,
	createIframeManager,
	initAuthTokenListener,
	printAuthToken,
	withKeepAlive,
} from "./lib";

// ============================================================================
// Initialize all managers
// ============================================================================

/** Manages iframe injection and positioning */
const iframeManager = createIframeManager();

/** Manages API calls to external services (TODO: implement) */
const apiClient = createApiClient();

/** Manages page automation (clicking, file uploads, etc) (TODO: implement) */
// const pageAutomation = createPageAutomation();

// ============================================================================
// Helper function for long-running operations
// ============================================================================
// Set up auth token listening
// ============================================================================

// Start listening for auth tokens from page context
initAuthTokenListener();

// ============================================================================
// Set up iframe
// ============================================================================

// Inject iframe into page
iframeManager.init();

// ============================================================================
// Initialize state from background
// ============================================================================

/**
 * Fetches the current state from the background service worker.
 * Extracts status and location from the BackgroundState object.
 */
const initializeFromBackground = async (): Promise<void> => {
	try {
		const state: BackgroundState = await chrome.runtime.sendMessage({
			type: "GET_STATE_MESSAGE",
		});

		if (state?.tempData?.status !== "idle") {
			iframeManager.setFullscreen(true);
		}
		if (state?.tempData?.tempLocation) {
			iframeManager.updatePosition(state.tempData.tempLocation);
		}
	} catch (error) {
		console.error("Failed to initialize state from background:", error);
	}
};

// Fetch initial state and apply it
initializeFromBackground();

// ============================================================================
// Listen for messages from background worker
// ============================================================================

/**
 * Main message handler for all communication from the background worker.
 * Routes different message types to appropriate handlers/modules.
 *
 * Listens for state update messages from the background worker.
 * When state changes (status, location), updates the iframe accordingly.
 *
 * Message types:
 * - UPDATE_STATE_MESSAGE: State updates (handles fullscreen and position changes)
 * - PRINT_AUTH_TOKEN_MESSAGE: Debug logging of current auth token
 * - API_CALL_REQUEST: Make API call (TODO: implement)
 * - CLICK_BUTTON_REQUEST: Click element on page (TODO: implement)
 * - FILE_UPLOAD_REQUEST: Upload file (TODO: implement)
 */
chrome.runtime.onMessage.addListener(
	(
		message:
			| UpdateStateBroadcastMessage
			| PrintAuthTokenMessage
			| SplitwiseRowRequestMessage,
		_sender,
		sendResponse,
	) => {
		if (message.type === "UPDATE_STATE_BROADCAST_MESSAGE") {
			// Update iframe fullscreen state when status changes
			const status = message.payload?.tempData?.status;
			if (status !== undefined) {
				iframeManager.setFullscreen(status !== "idle");
			}

			// Update iframe position when location changes
			const location = message.payload?.tempData?.tempLocation;
			if (location !== undefined) {
				iframeManager.updatePosition(location);
			}
		} else if (message.type === "PRINT_AUTH_TOKEN_MESSAGE") {
			// Log current auth token for debugging
			printAuthToken();
		} else if (message.type === "SPLITWISE_ROW_REQUEST_MESSAGE") {
			// Wrap the API call with keep-alive messaging
			withKeepAlive(() => apiClient.fetchSplitwiseRows()).then((rows) => {
				sendResponse({
					type: "SPLITWISE_ROW_RESPONSE_MESSAGE",
					payload: rows,
				} satisfies SplitwiseRowResponseMessage);
			});
		}
		// TODO: Handle additional message types for API calls and page automation
		// else if (message.type === "API_CALL_REQUEST") {
		//   apiClient.makeCall(message.payload).then(sendResponse);
		// } else if (message.type === "CLICK_BUTTON_REQUEST") {
		//   pageAutomation.clickButton(message.payload.selector).then(sendResponse);
		// } else if (message.type === "FILE_UPLOAD_REQUEST") {
		//   pageAutomation.uploadFile(message.payload.selector, message.payload.fileData).then(sendResponse);
		// }

		return true; // Keep channel open for async response
	},
);

// ============================================================================
// Inject page context script for fetch interception
// ============================================================================

/**
 * The page context script runs in the window context (not extension context).
 * This allows it to wrap window.fetch and capture authorization headers.
 * We inject it as an external script so it runs in the correct context.
 */
(() => {
	const script = document.createElement("script");
	script.src = chrome.runtime.getURL("dist/fetch-interceptor.js");
	script.onload = () => script.remove(); // Clean up script tag after loading
	(document.head || document.documentElement).appendChild(script);
})();
