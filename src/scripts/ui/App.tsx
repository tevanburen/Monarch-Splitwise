import { NewWidget } from "@/components";
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
		</div>
	);
};
