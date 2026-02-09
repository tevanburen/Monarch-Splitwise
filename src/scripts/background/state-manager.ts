import type {
	BackgroundDriverData,
	BackgroundState,
	UpdateStateMessagePayload,
} from "@/types";
import { broadcastStateUpdate } from "./background.utils";

/**
 * Interface for state management operations in the background worker.
 */
export interface StateManager {
	/** Get the current extension state */
	getState: () => BackgroundState;
	/** Get the current driver data (active tab IDs) */
	getDriverData: () => BackgroundDriverData;
	/** Update state with partial changes and broadcast to all contexts */
	updateState: (partialNewState: UpdateStateMessagePayload) => void;
	/** Update driver data with partial changes */
	updateDriverData: (partialNewData: Partial<BackgroundDriverData>) => void;
}

/**
 * Creates and returns a state manager instance for the background worker.
 * Manages both the extension state and driver data.
 *
 * @returns StateManager instance
 */
export const createStateManager = (): StateManager => {
	// Initialize state
	const state: BackgroundState = {
		syncData: {
			lastSynced: undefined,
			location: "right",
		},
		tempData: {
			clickNumber: 0,
			tempLocation: "left",
			status: "idle",
		},
	};

	// Driver data
	const driverData: BackgroundDriverData = {
		primarySplitwiseTabId: null,
		primaryMonarchTabId: null,
	};

	return {
		getState: () => state,
		getDriverData: () => driverData,
		updateState: (partialNewState: UpdateStateMessagePayload) => {
			// Update temp data
			if (partialNewState.tempData) {
				state.tempData = { ...state.tempData, ...partialNewState.tempData };
			}

			// Update sync data
			if (partialNewState.syncData) {
				state.syncData = { ...state.syncData, ...partialNewState.syncData };
			}

			// Broadcast state update to all extension contexts
			broadcastStateUpdate(partialNewState);
		},
		updateDriverData: (partialNewData: Partial<BackgroundDriverData>) => {
			if (partialNewData.primarySplitwiseTabId !== undefined) {
				driverData.primarySplitwiseTabId = partialNewData.primarySplitwiseTabId;
			}
			if (partialNewData.primaryMonarchTabId !== undefined) {
				driverData.primaryMonarchTabId = partialNewData.primaryMonarchTabId;
			}
		},
	};
};
