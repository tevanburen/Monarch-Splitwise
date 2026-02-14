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
