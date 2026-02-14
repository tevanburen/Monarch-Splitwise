/**
 * Message types for communication between different parts of the extension.
 * Includes messages for:
 * - Background <-> Content script communication
 * - Page context <-> Extension context communication
 * - State management and synchronization
 */

import type { AccountFetchResult } from "./rows";
import type { BackgroundStateSyncData, BackgroundStateTempData } from "./state";

// ============================================================================
// Page Context Messages
// ============================================================================

/**
 * Message format for communication between page context and extension context.
 * Used to pass auth tokens and Splitwise user data captured from API requests.
 */
export type PageContextMessage =
	| {
			isTvbMessage: true;
			source: "page-context";
			type: "monarchAuthToken";
			payload: string;
	  }
	| {
			isTvbMessage: true;
			source: "page-context";
			type: "splitwiseUserName";
			payload: string;
	  };

// ============================================================================
// State Management Messages
// ============================================================================

export type GetStateMessage = {
	type: "GET_STATE_MESSAGE";
};

export type UpdateStateMessagePayload = {
	syncData?: Partial<BackgroundStateSyncData>;
	tempData?: Partial<BackgroundStateTempData>;
};

export type UpdateStateRequestMessage = {
	type: "UPDATE_STATE_REQUEST_MESSAGE";
	payload: UpdateStateMessagePayload;
};

export type UpdateStateBroadcastMessage = {
	type: "UPDATE_STATE_BROADCAST_MESSAGE";
	payload: UpdateStateMessagePayload;
};

// ============================================================================
// Driver & Control Messages
// ============================================================================

export type RunDriverMessage = {
	type: "RUN_DRIVER_MESSAGE";
};

export type ExitSettingsMessage = {
	type: "EXIT_SETTINGS_MESSAGE";
	payload: boolean;
};

export type KeepAliveMessage = {
	type: "KEEP_ALIVE_MESSAGE";
};

// ============================================================================
// Data Fetching Messages
// ============================================================================

export type SplitwiseRowRequestMessage = {
	type: "SPLITWISE_ROW_REQUEST_MESSAGE";
	payload: string[];
};

export type SplitwiseRowResponseMessage = {
	type: "SPLITWISE_ROW_RESPONSE_MESSAGE";
	payload: Record<string, AccountFetchResult>;
};

export type MonarchRowRequestMessage = {
	type: "MONARCH_ROW_REQUEST_MESSAGE";
	payload: string[];
};

export type MonarchRowResponseMessage = {
	type: "MONARCH_ROW_RESPONSE_MESSAGE";
	payload: Record<string, AccountFetchResult>;
};
