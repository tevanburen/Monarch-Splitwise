/**
 * Helper utilities for managing keep-alive messages during long-running operations.
 *
 * When the content script performs long operations that take time,
 * it needs to send periodic keep-alive messages to the background worker
 * to prevent timeout. This module provides helpers to manage that communication.
 */

import type { KeepAliveMessage } from "@/types";

/**
 * Wraps a long-running async operation and sends keep-alive messages to the background worker.
 * Sends a KEEP_ALIVE_MESSAGE every 1 second to prevent the background worker from timing out.
 *
 * Use this to wrap any operation that might take more than 3 seconds to complete.
 *
 * @param messageId Unique identifier to correlate keep-alive messages with the operation
 * @param operation The async function to execute
 * @returns Promise resolving to the operation result
 * @throws Re-throws any error thrown by the operation
 *
 * @example
 * const rows = await withKeepAlive(message.messageId, () => apiClient.fetchSplitwiseRows());
 */
export const withKeepAlive = async <T>(
	messageId: string,
	operation: () => Promise<T>,
): Promise<T> => {
	const keepAliveInterval = setInterval(() => {
		chrome.runtime
			.sendMessage({
				type: "KEEP_ALIVE_MESSAGE",
				messageId,
			} satisfies KeepAliveMessage)
			.catch(() => {
				// Ignore errors if background worker is not listening
			});
	}, 1000);

	try {
		return await operation();
	} finally {
		clearInterval(keepAliveInterval);
	}
};
