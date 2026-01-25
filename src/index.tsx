import { createRoot } from "react-dom/client";
import "../globals.css";
import { WidgetCard } from "./components";

const wrapper = document.createElement("div");
wrapper.id = "monarch-splitwise-widget-root";
document.body.appendChild(wrapper);

const root = createRoot(wrapper);
root.render(<WidgetCard><div>tvbtvbtvb</div></WidgetCard>);
