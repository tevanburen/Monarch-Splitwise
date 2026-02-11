import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/scripts/ui/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
} from "@/scripts/ui/components/shadcn/dialog";
import { Field, FieldDescription } from "@/scripts/ui/components/shadcn/field";
import { Input } from "@/scripts/ui/components/shadcn/input";
import { Separator } from "@/scripts/ui/components/shadcn/separator";
import { useRuntimeStateContext } from "@/scripts/ui/providers";
import type { TvbAccount, WidgetStatus } from "@/types";

export const SettingsModal = () => {
	const { status, updateSingleTempState } = useRuntimeStateContext();
	const [isVisible, setIsVisible] = useState(true);

	const accounts: TvbAccount[] = [
		{
			monarchId: "2088366408340938630834093863",
			splitwiseId: "65530658",
			accountName: "Example Account",
			startDate: "2024-01-01",
		},
	];

	const handleCancel = () => {
		updateSingleTempState<WidgetStatus>("status", "idle");
	};

	const handleSave = () => {
		// TODO: Implement save logic
		updateSingleTempState<WidgetStatus>("status", "idle");
	};

	return (
		<Dialog
			open={status === "editing"}
			onOpenChange={(open) => {
				if (!open) {
					updateSingleTempState<WidgetStatus>("status", "idle");
				}
			}}
		>
			<DialogOverlay className="bg-black/40" />
			<DialogContent
				onInteractOutside={(e) => e.preventDefault()}
				showCloseButton={false}
			>
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div className="space-y-2">
						<h3 className="text-sm font-semibold">System Settings</h3>
						<div className="text-sm text-muted-foreground">
							Configure system preferences here
						</div>
					</div>
					<div className="space-y-3 flex flex-col">
						<h3 className="text-sm font-semibold">Accounts</h3>
						<div className="border rounded-lg overflow-hidden flex flex-col max-h-64">
							<div className="overflow-y-auto">
								{accounts.map((account, index) => (
									<div key={account.monarchId}>
										<div className="p-4 space-y-3">
											<div className="grid grid-cols-2 gap-3">
												<div className="flex-1">
													<Field className="gap-1">
														<Input
															value={account.accountName}
															placeholder="Enter account name"
														/>
														<FieldDescription>Account Name</FieldDescription>
													</Field>
												</div>
												<div className="flex-1 flex gap-3 items-start">
													<Field className="gap-1 flex-1">
														<Input
															type="date"
															value={account.startDate ?? "hi"}
														/>
														<FieldDescription>Start Date</FieldDescription>
													</Field>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setIsVisible(!isVisible)}
														className="mt-0.5"
													>
														{isVisible ? (
															<Eye className="h-4 w-4 text-secondary" />
														) : (
															<EyeOff className="h-4 w-4 text-primary" />
														)}
													</Button>
												</div>
											</div>
											<div className="grid grid-cols-2 gap-3">
												<Field className="gap-1">
													<Input
														value={account.monarchId}
														placeholder="Enter Monarch ID"
													/>
													<FieldDescription>Monarch ID</FieldDescription>
												</Field>
												<Field className="gap-1">
													<Input
														value={account.splitwiseId}
														placeholder="Enter Splitwise ID"
													/>
													<FieldDescription>Splitwise ID</FieldDescription>
												</Field>
											</div>
										</div>
										{index < accounts.length - 1 && <Separator />}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						className="text-primary"
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button variant="secondary" onClick={handleSave}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
