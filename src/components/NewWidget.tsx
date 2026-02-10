import { RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import { useRuntimeStateContext } from "@/providers";

export const NewWidget = () => {
	const { status, updateSingleTempState } = useRuntimeStateContext();

	const isEditing = status === "editing";
	const isRunning = status === "running";

	return (
		<Card className="p-2 gap-2">
			<CardHeader className="p-0 gap-0">
				{/* I don't know why the following line needs pr-2, but it works */}
				<CardTitle className="text-xl whitespace-nowrap pr-2">
					<span className="text-primary">Monarch</span>
					{" - "}
					<span className="text-secondary">Splitwise</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex gap-2 p-0">
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
				<Button variant="outline" className="gap-2 flex-1 text-primary">
					<RefreshCw className={isRunning ? "animate-spin" : ""} />
					Sync
				</Button>
			</CardContent>
		</Card>
	);
};
