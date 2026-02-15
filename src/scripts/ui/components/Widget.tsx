import {
	CheckCircle2,
	ChevronUp,
	RefreshCw,
	Settings,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/scripts/ui/components/shadcn/button";
import { Card } from "@/scripts/ui/components/shadcn/card";
import { useRuntimeStateContext } from "@/scripts/ui/providers";
import type { AccountStatus } from "@/types";

const numRowsToShowWithoutExpanding = 1;

export const Widget = () => {
	const { status, updateSingleTempState, runDriver, activeAccounts } =
		useRuntimeStateContext();
	const [isExpanded, setIsExpanded] = useState(false);

	const isEditing = status === "editing";
	const isRunning = status === "running";

	const anyErrors = activeAccounts.some(
		(account) => account.accountStatus === "error",
	);
	const hasStarted =
		isRunning ||
		anyErrors ||
		activeAccounts.some((account) => account.accountStatus === "success");

	const getIcon = (accountStatus: AccountStatus) => {
		if (!hasStarted) {
			return (
				<div className="w-4 h-4 flex items-center justify-center">
					<div className="w-1.5 h-1.5 rounded-full bg-foreground" />
				</div>
			);
		} else if (accountStatus === "error") {
			return <XCircle className="w-4 h-4 text-primary" />;
		} else if (accountStatus === "success") {
			return <CheckCircle2 className="w-4 h-4 text-secondary" />;
		} else {
			return <div>TODO</div>;
		}
	};

	console.log(activeAccounts);

	return (
		<Card className="p-2 gap-2">
			<div className="text-xl leading-none whitespace-nowrap">
				<span className="text-primary">Monarch</span>
				{" - "}
				<span className="text-secondary">Splitwise</span>
			</div>
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
							: hasStarted && !isRunning && !anyErrors
								? "All accounts synced"
								: "Expand accounts"}
					</span>
					{hasStarted &&
						!isRunning &&
						!anyErrors &&
						!isExpanded &&
						getIcon("success")}
				</button>
			)}
			<div className="flex gap-2 mt-0.5">
				<Button
					size="icon"
					variant="outline"
					className="text-secondary"
					onClick={() =>
						updateSingleTempState("status", isEditing ? "idle" : "editing")
					}
				>
					<Settings className={isEditing ? "animate-spin" : ""} />
				</Button>
				<Button
					variant="outline"
					className="gap-2 flex-1 text-primary"
					onClick={runDriver}
				>
					<RefreshCw className={isRunning ? "animate-spin" : ""} />
					Sync
				</Button>
			</div>
		</Card>
	);
};
