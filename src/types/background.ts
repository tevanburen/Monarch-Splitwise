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
	// accounts, etc
}

export type WidgetLocation = "left" | "right";
export type WidgetStatus = "idle" | "running" | "editing";

export interface BackgroundStateTempData {
	clickNumber: number;
	tempLocation: WidgetLocation;
	status: WidgetStatus;
	// account success, etc
}

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
