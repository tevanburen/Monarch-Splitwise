import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export interface WidgetCardProps {
	cornerPosition?: "left" | "right";
}

/**
 * Main widget component that handles file uploads and displays account status.
 * Manages the upload flow for Splitwise CSV files and coordinates with Monarch accounts.
 *
 * @component
 */
export const WidgetCard = ({
	children,
	cornerPosition = "right",
}: PropsWithChildren<WidgetCardProps>) => {
	return (
		<div
			className={cn(
				"fixed bottom-2 z-99999 pointer-events-auto p-2 bg-card border rounded-lg shadow-widget isolate",
				cornerPosition === "right" ? "right-2" : "left-2",
			)}
		>
			{children}
		</div>
	);
};
