import { EditingModal, NewWidget } from "@/components";
import { useRuntimeStateContext } from "@/providers";

export const App = () => {
	const { status, tempLocation } = useRuntimeStateContext();

	const isFullscreen = status !== "idle";

	return (
		<div className={isFullscreen ? "relative h-screen w-screen" : ""}>
			<div
				className={
					isFullscreen
						? `fixed bottom-5 ${tempLocation === "left" ? "left-5" : "right-5"}`
						: ""
				}
			>
				<NewWidget />
			</div>
			{status === "running" && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white" />
				</div>
			)}
			<EditingModal />
		</div>
	);
};
