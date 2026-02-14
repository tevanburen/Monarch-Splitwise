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
 * Expects periodic StayAliveMessages to reset the timeout.
 * If no message is received for 3 seconds, rejects with an error.
 *
 * @param tabId The tab ID to send the message to
 * @param message The message to send
 * @returns Promise resolving to the response from the content script
 * @throws Error if no keep-alive message is received within 3 seconds
 */
export const sendMessageWithKeepAlive = async <T = unknown>(
	tabId: number,
	message: unknown,
): Promise<T> => {
	let keepAliveTimeout: number | null = null;
	let responseReceived = false;

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

		// Listen for keep-alive messages from the tab
		const keepAliveListener = (msg: KeepAliveMessage) => {
			if (msg?.type === "KEEP_ALIVE_MESSAGE") {
				resetTimeout();
			}
		};

		chrome.runtime.onMessage.addListener(keepAliveListener);

		// Send the message and handle response
		chrome.tabs
			.sendMessage(tabId, message)
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
		console.log(`Acquiring lock for method: ${method.name}`);
		await prev;
		console.log(`Lock acquired for method: ${method.name}`);
		try {
			console.log(`Executing method: ${method.name} with args:`, args);
			return await method(...args);
		} finally {
			console.log(`Releasing lock for method: ${method.name}`);
			resolve?.();
		}
	};
};
