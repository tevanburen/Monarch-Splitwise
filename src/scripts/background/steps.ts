import type {
	SplitwiseRowRequestMessage,
	SplitwiseRowResponseMessage,
} from "@/types";
import { sendMessageWithKeepAlive } from "./background.utils";

export const fetchRowsFromSplitwise = async (
	primarySplitwiseTabId: number | null,
): Promise<string[]> => {
	if (primarySplitwiseTabId === null) {
		throw new Error("No primary Splitwise tab set");
	}

	// Send request to content script on the Splitwise tab with keep-alive monitoring
	const response = await sendMessageWithKeepAlive<SplitwiseRowResponseMessage>(
		primarySplitwiseTabId,
		{
			type: "SPLITWISE_ROW_REQUEST_MESSAGE",
		} satisfies SplitwiseRowRequestMessage,
	);

	// Extract rows from response payload
	return response.payload;
};
