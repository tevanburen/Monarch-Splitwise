/**
 * Utility functions for the background service worker.
 * Contains helpers for tab communication, state management, and keep-alive messaging.
 */

import type {
	KeepAliveMessage,
	UpdateStateBroadcastMessage,
	UpdateStateMessagePayload,
} from "@/types";

/**
 * Determines what type of page a tab is on based on its URL.
 *
 * @param tab The Chrome tab to check
 * @returns "splitwise", "monarch", or null if the tab is not on either site
 */
export const getTabType = (
	tab: chrome.tabs.Tab,
): "splitwise" | "monarch" | null => {
	if (!tab.url) {
		return null;
	} else if (tab.url.includes("secure.splitwise.com")) {
		return "splitwise";
	} else if (tab.url.includes("app.monarch.com")) {
		return "monarch";
	}
	return null;
};

/**
 * Sends a message to a content script with a keep-alive timeout.
 * Generates a unique message ID and expects periodic keep-alive messages with matching ID.
 * If no matching keep-alive is received for 3 seconds, rejects with an error.
 *
 * @param tabId The tab ID to send the message to
 * @param message The message to send (will be augmented with messageId)
 * @returns Promise resolving to the response from the content script
 * @throws Error if no keep-alive message is received within 3 seconds
 */
export const sendMessageWithKeepAlive = async <T = unknown>(
	tabId: number,
	message: unknown,
): Promise<T> => {
	let keepAliveTimeout: number | null = null;
	let responseReceived = false;

	// Generate unique message ID
	const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	const messageWithId = {
		...(message as Record<string, unknown>),
		messageId,
	};

	return new Promise((resolve, reject) => {
		// Set up the initial timeout
		const resetTimeout = () => {
			if (keepAliveTimeout) {
				clearTimeout(keepAliveTimeout);
			}
			keepAliveTimeout = setTimeout(() => {
				if (!responseReceived) {
					reject(
						new Error(
							`Keep-alive timeout: No message from tab ${tabId} for 3 seconds`,
						),
					);
				}
			}, 3000);
		};

		// Listen for keep-alive messages with matching ID
		const keepAliveListener = (msg: KeepAliveMessage) => {
			if (msg?.type === "KEEP_ALIVE_MESSAGE" && msg.messageId === messageId) {
				resetTimeout();
			}
		};

		chrome.runtime.onMessage.addListener(keepAliveListener);

		// Send the message with messageId and handle response
		chrome.tabs
			.sendMessage(tabId, messageWithId)
			.then((response: T) => {
				responseReceived = true;
				if (keepAliveTimeout) {
					clearTimeout(keepAliveTimeout);
				}
				chrome.runtime.onMessage.removeListener(keepAliveListener);
				resolve(response);
			})
			.catch((error) => {
				if (keepAliveTimeout) {
					clearTimeout(keepAliveTimeout);
				}
				chrome.runtime.onMessage.removeListener(keepAliveListener);
				reject(error);
			});

		// Start the initial timeout
		resetTimeout();
	});
};

/**
 * Broadcasts a state update to all extension contexts (tabs, iframes, popups, etc).
 *
 * @param payload The state update payload containing tempData and/or syncData changes
 */
export const broadcastStateUpdate = (payload: UpdateStateMessagePayload) => {
	const message: UpdateStateBroadcastMessage = {
		type: "UPDATE_STATE_BROADCAST_MESSAGE",
		payload,
	};

	// Send to all tabs (content scripts/iframes)
	chrome.tabs.query({}, (tabs) => {
		for (const tab of tabs) {
			if (tab.id) {
				chrome.tabs.sendMessage(tab.id, message).catch(() => {
					// Ignore errors for tabs that don't have listeners
				});
			}
		}
	});

	// Note: Extension pages (like iframes) will receive via runtime.onMessage
	chrome.runtime.sendMessage(message).catch(() => {
		// Ignore if no listeners
	});
};

/**
 * Waits for a tab to send its first message, indicating it's ready.
 * This is more reliable than checking tab.status since it confirms the content script is loaded.
 *
 * @param tabId The tab ID to wait for
 * @param timeoutMs Maximum time to wait in milliseconds (default: 10000)
 * @throws Error if the timeout is exceeded or tab becomes invalid
 */
export const waitForTabReady = async (
	tabId: number,
	timeoutMs = 10000,
): Promise<void> => {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			chrome.runtime.onMessage.removeListener(messageListener);
			reject(
				new Error(`Timeout waiting for tab ${tabId} to send ready message`),
			);
		}, timeoutMs);

		const messageListener = (
			_message: unknown,
			sender: chrome.runtime.MessageSender,
		) => {
			// Check if message is from the tab we're waiting for
			if (sender.tab?.id === tabId) {
				clearTimeout(timeout);
				chrome.runtime.onMessage.removeListener(messageListener);
				resolve();
			}
		};

		chrome.runtime.onMessage.addListener(messageListener);
	});
};

/**
 * Creates a new tab or validates an existing tab is still open.
 * If the existing tab is valid, returns its ID.
 * If not, creates a new tab at the specified URL and waits for it to be ready.
 *
 * @param existingTabId The ID of an existing tab, or null if none exists
 * @param url The URL to open if a new tab needs to be created
 * @returns The tab ID (either the existing one or newly created)
 * @throws Error if tab creation fails
 */
export const createOrGetTab = async (
	existingTabId: number | null,
	url: string,
): Promise<number> => {
	// Check if existing tab is still valid
	if (existingTabId !== null) {
		try {
			await chrome.tabs.get(existingTabId);
			return existingTabId;
		} catch {
			// Tab no longer exists, will create a new one
		}
	}

	// Create new tab
	const tab = await chrome.tabs.create({
		url,
		active: false,
	});

	if (!tab.id) {
		throw new Error("Failed to create tab");
	}

	// Wait for tab to load and content script to be ready
	await waitForTabReady(tab.id);

	return tab.id;
};

const locks = new Map<() => unknown, Promise<void>>();

export const withLock = <
	TReturn = unknown,
	TArgs extends unknown[] = unknown[],
>(
	method: (...args: TArgs) => Promise<TReturn>,
) => {
	return async (...args: TArgs): Promise<TReturn> => {
		const prev = locks.get(method) ?? Promise.resolve();
		let resolve: (() => void) | undefined;
		const next = new Promise<void>((r) => {
			resolve = r;
		});
		locks.set(method, next);
		await prev;
		try {
			return await method(...args);
		} finally {
			resolve?.();
		}
	};
};
