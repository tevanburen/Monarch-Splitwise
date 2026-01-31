import { useEffect, useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import { useRuntimeStateContext } from "@/providers";

export const App = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { clickNumber, updateSingleTempState } = useRuntimeStateContext();

	// Notify parent to toggle fullscreen when loading state changes
	useEffect(() => {
		window.parent.postMessage(
			{ type: "toggle-fullscreen", fullscreen: isLoading },
			"*",
		);
	}, [isLoading]);

	return (
		<Card className="pointer-events-auto">
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card Description</CardDescription>
				<CardAction>
					<Button onClick={() => setIsExpanded(!isExpanded)}>
						{isExpanded ? "Shrink" : "Expand"}
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<p>Card Content</p>
				<div className="mt-4 space-y-2">
					<Button
						onClick={() =>
							updateSingleTempState("clickNumber", (prev: number) => prev + 1)
						}
					>
						Clicks: {clickNumber}
					</Button>
					<Button onClick={() => setIsLoading(!isLoading)} variant="outline">
						{isLoading ? "Stop Loading" : "Start Loading"}
					</Button>
				</div>
				{isExpanded && (
					<div className="mt-4 space-y-2">
						<p>Extra line 1</p>
						<p>Extra line 2</p>
						<p>Extra line 3</p>
						<p>Extra line 4</p>
						<p>Extra line 5</p>
						<p>Extra line 6</p>
						<p>Extra line 7</p>
						<p>Extra line 8</p>
					</div>
				)}
			</CardContent>
			<CardFooter>
				<p>Card Footer</p>
			</CardFooter>
		</Card>
	);
};
