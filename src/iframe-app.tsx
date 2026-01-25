import { createRoot } from "react-dom/client";
import "../globals.css";
import { WidgetCard } from "./components";

const el = document.getElementById("root");
if (!el) {
	throw new Error("Root element not found");
}

const root = createRoot(el);
root.render(
	<WidgetCard>
		<div>tvbtvbtvb</div>
	</WidgetCard>,
);
