import type { TvbAccount } from "./accounts";

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

export type UpdateStateMessage = {
	type: "UPDATE_STATE_MESSAGE";
	payload: UpdateStateMessagePayload;
};

export type RunDriverMessage = {
	type: "RUN_DRIVER_MESSAGE";
};

export type PrintAuthTokenMessage = {
	type: "PRINT_AUTH_TOKEN_MESSAGE";
};

export type SplitwiseRowRequestMessage = {
	type: "SPLITWISE_ROW_REQUEST_MESSAGE";
};

export type SplitwiseRowResponseMessage = {
	type: "SPLITWISE_ROW_RESPONSE_MESSAGE";
	payload: string[];
};

export type KeepAliveMessage = {
	type: "KEEP_ALIVE_MESSAGE";
};
