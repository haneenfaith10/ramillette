import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/sweetalert2-theme.css";
import App from "./App.jsx";

// ROBUST FIX: The backend API has a strict CORS policy that only allows the naked domain (ramillette.com).
// If a user clicks a link that contains the 'www.' subdomain (e.g., from WhatsApp or Facebook),
// all API calls (like fetching products) will fail and return empty data.
// This safely forces a redirect to the naked domain before React even initializes.
if (typeof window !== "undefined" && window.location.hostname === "www.ramillette.com") {
  window.location.replace(window.location.href.replace("www.", ""));
}

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
