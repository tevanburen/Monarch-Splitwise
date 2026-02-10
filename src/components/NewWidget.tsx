import { Card, CardHeader, CardTitle } from "@/components/shadcn/card";

export const NewWidget = () => {
	return (
		<Card className="p-2">
			<CardHeader className="p-0 gap-0">
				{/* I don't know why the following line needs pr-2 */}
				<CardTitle className="text-xl whitespace-nowrap pr-2">
					<span className="text-orange-500">Monarch</span>
					{" - "}
					<span className="text-green-500">Splitwise</span>
				</CardTitle>
			</CardHeader>
			{/* <CardContent className="bg-pink-400">
				<div className="flex gap-2 w-fit mx-auto bg-yellow-300">
					<Button variant="outline" size="icon">
						<Settings size={18} />
					</Button>
					<Button className="gap-2 flex-1">
						<RefreshCw size={18} />
						Sync
					</Button>
				</div>
			</CardContent> */}
		</Card>
	);
};
