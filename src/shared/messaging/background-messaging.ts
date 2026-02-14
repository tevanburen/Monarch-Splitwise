/**
 * Background service worker messaging utilities.
 * Handles message sending with keep-alive timeout monitoring.
 */

import type { KeepAliveMessage } from "@/types";

/**
 * Sends a message to a content script with a keep-alive timeout.
 * Expects periodic KeepAliveMessages to reset the timeout.
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
