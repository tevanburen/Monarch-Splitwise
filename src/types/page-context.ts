/**
 * Message format for communication between page context and extension context.
 * Used to pass auth tokens captured from Monarch API requests.
 */
export interface PageContextMessage {
	isTvbMessage: true;
	source: "page-context";
	type: "authToken";
	payload: string;
}
