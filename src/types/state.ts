/**
 * State management types for background service worker and UI.
 */

import type { TvbAccount } from "./accounts";

// ============================================================================
// Background State
// ============================================================================

/**
 * Background service worker state interface
 */
export interface BackgroundState {
	syncData: BackgroundStateSyncData;
	tempData: BackgroundStateTempData;
}

/**
 * Persistent/synced state data
 */
export interface BackgroundStateSyncData {
	lastSynced?: number;
	location: WidgetLocation;
	accounts: TvbAccount[];
}

/**
 * Temporary/ephemeral state data
 */
export interface BackgroundStateTempData {
	clickNumber: number;
	tempLocation: WidgetLocation;
	status: WidgetStatus;
	tempAccounts: TvbAccount[];
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Widget position on screen
 */
export type WidgetLocation = "left" | "right";

/**
 * Widget operational status
 */
export type WidgetStatus = "idle" | "running" | "editing";

// ============================================================================
// Driver State
// ============================================================================

/**
 * Driver state for managing active tabs.
 * Tracks which tabs are being used for Splitwise and Monarch communication.
 */
export type BackgroundDriverData = {
	primarySplitwiseTabId: number | null;
	primaryMonarchTabId: number | null;
};
