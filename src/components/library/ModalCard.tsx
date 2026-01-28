import { XIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

export interface ModalCardProps {
	open: boolean;
	onClose: () => void;
	className?: string;
	title?: string;
}

/**
 * A modal card that appears in the center of the screen with an overlay
 *
 * @component
 */
export const ModalCard = ({
	children,
	open,
	onClose,
	className,
	title,
}: PropsWithChildren<ModalCardProps>) => {
	if (!open) return null;

	return (
		<>
			{/* Overlay */}
			<button
				type="button"
				className="fixed inset-0 bg-black/50 z-1005 pointer-events-auto cursor-default"
				onClick={onClose}
				aria-label="Close modal"
			/>
			{/* Modal */}
			<div
				className={cn(
					"fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-1006 pointer-events-auto bg-card border rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-auto",
					className,
				)}
			>
				{title && (
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold">{title}</h2>
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							className="h-8 w-8 p-0"
						>
							<XIcon className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</Button>
					</div>
				)}
				{children}
			</div>
		</>
	);
};
