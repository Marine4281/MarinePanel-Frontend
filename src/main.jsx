import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ResellerProvider } from "./context/ResellerContext";


import "./index.css";
import App from "./App.jsx";

// 🔥 NEW
import { ServicesProvider } from "./context/ServicesContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ServicesProvider>
        <App />
      </ServicesProvider>
    </BrowserRouter>
  </StrictMode>
);
