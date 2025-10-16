import { createRoot } from "react-dom/client";
import { App } from "./App";

const wrapper = document.createElement("div");
wrapper.style.cssText =
	"position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; pointer-events: none";
document.body.appendChild(wrapper);

const root = createRoot(wrapper);
root.render(<App />);
