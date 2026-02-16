import type {
	AccountStatus,
	BackgroundState,
	UpdateStateMessagePayload,
} from "@/types";
import { broadcastStateUpdate } from "./background.utils";

/**
 * State manager for the background worker.
 * Manages both the extension state and driver data.
 * Sync data is persisted to Chrome storage.sync and restored on initialization.
 */

// Initialize state
const state: BackgroundState = {
	syncData: {
		lastSynced: undefined,
		location: "right",
		accounts: [],
	},
	tempData: {
		clickNumber: 0,
		tempLocation: "right",
		status: "idle",
		tempAccounts: [],
		accountStatusMap: {},
	},
};

/**
 * Persists sync data to Chrome storage.sync
 */
const persistSyncData = async (): Promise<void> => {
	try {
		await chrome.storage.sync.set({ syncData: state.syncData });
	} catch (error) {
		console.error("Failed to persist sync data:", error);
	}
};

/**
 * Loads sync data from Chrome storage.sync
 */
const loadSyncData = async (): Promise<void> => {
	try {
		const result = await chrome.storage.sync.get("syncData");
		if (result.syncData) {
			state.syncData = { ...state.syncData, ...result.syncData };
			state.tempData.tempLocation = state.syncData.location;
			state.tempData.tempAccounts = state.syncData.accounts;
		}
	} catch (error) {
		console.error("Failed to load sync data:", error);
	}
};

// Load sync data on initialization (fire and forget)
loadSyncData();

/**
 * Get the current extension state.
 */
export const getState = (): BackgroundState => state;

/**
 * Update state with partial changes and broadcast to all contexts.
 */
export const updateState = (
	partialNewState: UpdateStateMessagePayload,
): void => {
	// Update temp data
	if (partialNewState.tempData) {
		state.tempData = { ...state.tempData, ...partialNewState.tempData };
	}

	// Update sync data
	if (partialNewState.syncData) {
		state.syncData = {
			...state.syncData,
			...partialNewState.syncData,
			lastSynced: Date.now(),
		};
		// Persist sync data to Chrome storage
		persistSyncData().catch((error) => {
			console.error("Error persisting sync data:", error);
		});
	}

	// Broadcast state update to all extension contexts
	broadcastStateUpdate(partialNewState);
};

/**
 * Exit settings, either reverting or saving the data.
 */
export const exitSettings = (save: boolean = false): void => {
	updateState(
		save
			? {
					tempData: {
						status: "idle",
					},
					syncData: {
						accounts: state.tempData.tempAccounts,
						location: state.tempData.tempLocation,
					},
				}
			: {
					tempData: {
						status: "idle",
						tempAccounts: state.syncData.accounts,
					},
					syncData: {
						location: state.tempData.tempLocation,
					},
				},
	);
};

/**
 * Update the status of a specific account in the account status map.
 */
export const updateAccountStatus = (
	...newRows: { monarchId: string; status: AccountStatus }[]
): void => {
	if (newRows.length === 0) return;
	updateState({
		tempData: {
			accountStatusMap: {
				...state.tempData.accountStatusMap,
				...Object.fromEntries(
					newRows.map(({ monarchId, status }) => [monarchId, status]),
				),
			},
		},
	});
};
