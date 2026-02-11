import { Button } from "@/scripts/ui/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
} from "@/scripts/ui/components/shadcn/dialog";
import { Field, FieldLabel } from "@/scripts/ui/components/shadcn/field";
import { Input } from "@/scripts/ui/components/shadcn/input";
import { Separator } from "@/scripts/ui/components/shadcn/separator";
import { useRuntimeStateContext } from "@/scripts/ui/providers";
import type { TvbAccount, WidgetStatus } from "@/types";

export const SettingsModal = () => {
	const { status, updateSingleTempState } = useRuntimeStateContext();

	const accounts: TvbAccount[] = [
		{
			monarchId: "example",
			splitwiseId: "example",
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
											<div className="space-y-3">
												<Field>
													<FieldLabel>Account Name</FieldLabel>
													<Input
														value={account.accountName}
														placeholder="Enter account name"
													/>
												</Field>
												<Field>
													<FieldLabel>Monarch ID</FieldLabel>
													<Input
														value={account.monarchId}
														placeholder="Enter Monarch ID"
													/>
												</Field>
												<Field>
													<FieldLabel>Splitwise ID</FieldLabel>
													<Input
														value={account.splitwiseId}
														placeholder="Enter Splitwise ID"
													/>
												</Field>
												<Field>
													<FieldLabel>Start Date</FieldLabel>
													<Input
														type="date"
														value={account.startDate ?? "hi"}
													/>
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
