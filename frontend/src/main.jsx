import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { FinanceProvider } from "./context/FinanceContext.jsx";
import PhoneFrame from "./components/PhoneFrame.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FinanceProvider>
      <PhoneFrame>
        <App />
      </PhoneFrame>
    </FinanceProvider>
  </React.StrictMode>
);
