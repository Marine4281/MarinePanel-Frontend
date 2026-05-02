import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

// Context Providers
import { ServicesProvider } from "./context/ServicesContext";
import { ResellerProvider } from "./context/ResellerContext";
import { ChildPanelProvider } from "./context/ChildPanelContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ChildPanelProvider>
      <ResellerProvider>
        <ServicesProvider>
          <App />
        </ServicesProvider>
      </ResellerProvider>
      </ChildPanelProvider>
    </BrowserRouter>
  </StrictMode>
);
