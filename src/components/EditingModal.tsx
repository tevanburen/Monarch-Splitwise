import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { useRuntimeStateContext } from "@/providers";
import type { WidgetStatus } from "@/types";

export const EditingModal = () => {
	const { status, updateSingleTempState } = useRuntimeStateContext();

	return (
		<Dialog
			open={status === "editing"}
			onOpenChange={(open) => {
				if (!open) {
					updateSingleTempState<WidgetStatus>("status", "idle");
				}
			}}
		>
			<DialogOverlay className="bg-black/80" />
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Editing Mode</DialogTitle>
					<DialogDescription>
						This is a centered modal for editing.
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<p>Modal content goes here...</p>
				</div>
			</DialogContent>
		</Dialog>
	);
};
