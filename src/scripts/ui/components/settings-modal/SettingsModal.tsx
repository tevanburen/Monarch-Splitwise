import { Button } from "@/scripts/ui/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
} from "@/scripts/ui/components/shadcn/dialog";
import { Separator } from "@/scripts/ui/components/shadcn/separator";
import { useRuntimeStateContext } from "@/scripts/ui/providers";
import type { WidgetStatus } from "@/types";

export const SettingsModal = () => {
	const { status, updateSingleTempState } = useRuntimeStateContext();

	const accounts = [
		"Account 1",
		"Account 2",
		"Account 3",
		"Account 4",
		"Account 5",
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
									<div key={account}>
										<div className="p-4 space-y-3">
											<div className="text-sm font-medium">{account}</div>
											<div>todo: figure out inputs</div>
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
