import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

// Context Providers
import { ServicesProvider } from "./context/ServicesContext";
import { ResellerProvider } from "./context/ResellerContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ResellerProvider>
        <ServicesProvider>
          <App />
        </ServicesProvider>
      </ResellerProvider>
    </BrowserRouter>
  </StrictMode>
);
