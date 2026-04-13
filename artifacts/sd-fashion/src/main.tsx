import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

if (window.location.protocol === "file:") {
	setBaseUrl("http://127.0.0.1:3001");
}

createRoot(document.getElementById("root")!).render(<App />);
