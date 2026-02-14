import type { TvbAccount } from "./accounts";
import type { TvbRow } from "./rows";

/**
 * Background service worker state interface
 */
export interface BackgroundState {
	syncData: BackgroundStateSyncData;
	tempData: BackgroundStateTempData;
}

export interface BackgroundStateSyncData {
	lastSynced?: number;
	location: WidgetLocation;
	accounts: TvbAccount[];
	// accounts, etc
}

export type WidgetLocation = "left" | "right";
export type WidgetStatus = "idle" | "running" | "editing";

export interface BackgroundStateTempData {
	clickNumber: number;
	tempLocation: WidgetLocation;
	status: WidgetStatus;
	tempAccounts: TvbAccount[];
	// account success, etc
}

export type BackgroundDriverData = {
	primarySplitwiseTabId: number | null;
	primaryMonarchTabId: number | null;
};

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

export type RunDriverMessage = {
	type: "RUN_DRIVER_MESSAGE";
};

export type ExitSettingsMessage = {
	type: "EXIT_SETTINGS_MESSAGE";
	payload: boolean;
};

export type SplitwiseRowRequestMessage = {
	type: "SPLITWISE_ROW_REQUEST_MESSAGE";
	payload: string[];
};

export type SplitwiseRowResponseMessage = {
	type: "SPLITWISE_ROW_RESPONSE_MESSAGE";
	payload: Record<string, TvbRow[]>;
};

export type KeepAliveMessage = {
	type: "KEEP_ALIVE_MESSAGE";
};

export type MonarchRowRequestMessage = {
	type: "MONARCH_ROW_REQUEST_MESSAGE";
	payload: string[];
};

export type MonarchRowResponseMessage = {
	type: "MONARCH_ROW_RESPONSE_MESSAGE";
	payload: Record<string, TvbRow[]>;
};
