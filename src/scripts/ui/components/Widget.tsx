/**
 * Widget component for the Monarch-Splitwise extension.
 *
 * Displays a floating card in the corner of the page showing:
 * - Sync status for each configured account
 * - Sync/Re-Sync button to trigger the driver
 * - Settings button to open the configuration modal
 *
 * The widget auto-expands when syncing or when errors occur.
 */

import {
	CheckCircle2,
	ChevronUp,
	RefreshCw,
	Settings,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/scripts/ui/components/shadcn/button";
import { Card } from "@/scripts/ui/components/shadcn/card";
import { useRuntimeStateContext } from "@/scripts/ui/providers";
import type { AccountStatus } from "@/types";

/** Number of account rows to show before requiring expansion */
const numRowsToShowWithoutExpanding = 3;

/**
 * Main widget component rendered in the iframe overlay.
 *
 * @component
 */
export const Widget = () => {
	const { status, updateSingleTempState, runDriver, activeAccounts } =
		useRuntimeStateContext();
	const [isExpanded, setIsExpanded] = useState(false);

	const isEditing = status === "editing";
	const isRunning = status === "running";

	const someError = activeAccounts.some(
		(account) => account.accountStatus === "error",
	);
	const allSuccessful =
		!isRunning &&
		activeAccounts.length > 0 &&
		!someError &&
		activeAccounts.every((account) => account.accountStatus === "success");

	const getIcon = (accountStatus: AccountStatus) => {
		if (accountStatus === "success") {
			return <CheckCircle2 className="w-4 h-4 text-secondary" />;
		} else if (accountStatus === "error") {
			return <XCircle className="w-4 h-4 text-primary" />;
		} else if (isRunning) {
			return <RefreshCw className="w-4 h-4 animate-spin" />;
		} else {
			return (
				<div className="w-4 h-4 flex items-center justify-center">
					<div className="w-1.5 h-1.5 rounded-full bg-foreground" />
				</div>
			);
		}
	};

	// Automatically expand the widget if it's running or if there's an error
	useEffect(() => {
		setIsExpanded(isRunning || someError);
	}, [isRunning, someError]);

	return (
		<Card className="p-2 gap-2 max-w-48">
			<div className="text-xl leading-none whitespace-nowrap text-center">
				<span className="text-primary">Monarch</span>
				{" - "}
				<span className="text-secondary">Splitwise</span>
			</div>
			{activeAccounts.length > 0 && (
				<>
					{(isExpanded ||
						activeAccounts.length <= numRowsToShowWithoutExpanding) && (
						<div className="flex flex-col gap-1">
							{activeAccounts.map((account) => (
								<div
									key={account.monarchId}
									className="flex items-center gap-1.5 text-sm leading-none"
								>
									{getIcon(account.accountStatus)}
									<span className="flex-1">{account.accountName}</span>
								</div>
							))}
						</div>
					)}
					{activeAccounts.length > numRowsToShowWithoutExpanding && (
						<button
							type="button"
							className="flex items-center gap-1.5 text-sm leading-none w-full text-left"
							onClick={() => setIsExpanded(!isExpanded)}
						>
							<ChevronUp
								className={`w-4 h-4 transition-transform ${
									isExpanded ? "" : "rotate-90"
								}`}
							/>
							<span className="flex-1 whitespace-nowrap">
								{isExpanded
									? "Collapse accounts"
									: allSuccessful
										? "All accounts synced"
										: someError
											? "Error during sync"
											: "Expand accounts"}
							</span>
							{(allSuccessful || someError) &&
								!isExpanded &&
								getIcon(allSuccessful ? "success" : "error")}
						</button>
					)}
				</>
			)}
			<div className="flex gap-2 mt-0.5">
				{activeAccounts.length > 0 ? (
					<>
						<Button
							size="icon"
							variant="outline"
							className="text-secondary"
							onClick={() => updateSingleTempState("status", "editing")}
						>
							<Settings className={isEditing ? "animate-spin" : ""} />
						</Button>
						<Button
							variant="outline"
							className="gap-2 flex-1 text-primary"
							onClick={runDriver}
						>
							<RefreshCw className={isRunning ? "animate-spin" : ""} />
							{`${isRunning ? "Syncing..." : `${allSuccessful || someError ? "Re-Sync" : "Sync"}`}`}
						</Button>
					</>
				) : (
					<Button
						variant="outline"
						className="gap-2 flex-1"
						onClick={() => updateSingleTempState("status", "editing")}
					>
						<Settings className={isEditing ? "animate-spin" : ""} />
						Add accounts
					</Button>
				)}
			</div>
		</Card>
	);
};
