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

export const Widget = () => {
	const { status, updateSingleTempState, runDriver } = useRuntimeStateContext();
	const [isExpanded, setIsExpanded] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);

	const isEditing = status === "editing";
	const isRunning = status === "running";

	const accounts: {
		key: string;
		name: string;
		error?: boolean;
	}[] = [
		{ key: "1", name: "Scuba Club" },
		{ key: "2", name: "Hiking Club" },
		{ key: "3", name: "Book Club" },
		{ key: "4", name: "Chess Club" },
	];

	const anyErrors = accounts.some((account) => account.error);

	const getIcon = (error?: boolean) => {
		if (!hasStarted) {
			return (
				<div className="w-4 h-4 flex items-center justify-center">
					<div className="w-1.5 h-1.5 rounded-full bg-foreground" />
				</div>
			);
		} else if (error) {
			return <XCircle className="w-4 h-4 text-primary" />;
		} else {
			return <CheckCircle2 className="w-4 h-4 text-secondary" />;
		}
	};

	return (
		<Card className="p-2 gap-2">
			<button type="button" onClick={() => setHasStarted((prev) => !prev)}>
				tmp: toggle started
			</button>
			<div className="text-xl leading-none whitespace-nowrap">
				<span className="text-primary">Monarch</span>
				{" - "}
				<span className="text-secondary">Splitwise</span>
			</div>
			{(isExpanded || accounts.length <= 3) && (
				<div className="flex flex-col gap-1">
					{accounts.map((account) => (
						<div
							key={account.key}
							className="flex items-center gap-1.5 text-sm leading-none"
						>
							{getIcon(account.error)}
							<span className="flex-1">{account.name}</span>
						</div>
					))}
				</div>
			)}
			{accounts.length > 3 && (
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
							: hasStarted && !anyErrors
								? `All accounts synced`
								: "Expand accounts"}
					</span>
					{hasStarted && !isExpanded && !anyErrors && getIcon()}
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
