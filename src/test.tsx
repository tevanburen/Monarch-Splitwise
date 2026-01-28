import { useState } from "react";
import { Button } from "./components/shadcn/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./components/shadcn/card";

export const ExampleComponent = () => {
	const [isExpanded, setIsExpanded] = useState(false);

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
