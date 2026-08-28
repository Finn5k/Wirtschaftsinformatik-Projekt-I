import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./auth/AuthProvider";
import { ConfigurationNotice } from "./components/ConfigurationNotice";
import { missingConfiguration } from "./services/supabaseConfig";
import "leaflet/dist/leaflet.css";
import "./index.css";
import App from "./App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

// Fehlen die Zugangsdaten zu NB-02/NB-03, startet die Anwendung nicht — ohne
// NB-03 ist LocalCourt fachlich nicht nutzbar (S1.4). Der Hinweis wird dann
// anstelle der App gerendert, damit der Mangel sichtbar ist und nicht als
// weiße Seite endet.
createRoot(root).render(
  <StrictMode>
    {missingConfiguration.length > 0 ? (
      <ConfigurationNotice missing={missingConfiguration} />
    ) : (
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    )}
  </StrictMode>,
);
