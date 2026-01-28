import { createRoot } from "react-dom/client";
import "./inner-root.css";

const el = document.getElementById("root");
if (!el) {
	throw new Error("Root element not found");
}

const root = createRoot(el);
root.render(
		<div>tvbtvbtvb</div>
);
