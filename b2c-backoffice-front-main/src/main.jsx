import React from "react";
import ReactDOM from "react-dom/client";
import { AppRoutes
 } from "./routing/AppRoutes";
 import { AuthProvider } from "./Pages/auth/core/Auth";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
       <AuthProvider>
          <AppRoutes />
        </AuthProvider>

    </React.StrictMode>,
);
