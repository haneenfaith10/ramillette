import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ScrollToTop from "./Components/ScrollToTop/ScrollToTop";
import { Toaster } from "sonner";
import UserRoute from "./Routes/UserRoute";
import AdminRoute from "./Routes/AdminRoute";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCountry } from "./redux/slices/userSlice";
import { fetchCountries } from "./redux/slices/countrySlice.js";
import axios from "axios";
import Logo from "./assets/images/logo.png";
import NotFoundPage from "./Pages/404Page/NotFoundPage.jsx";
import { fetchUserCountryCode } from "./services/locationService";
import { findBestCountryMatch } from "./utils/locationHelper";

function App() {
  const dispatch = useDispatch();
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const isAppLoading = useSelector((state) => state.user.isAppLoading);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);

        // 1. Fetch available countries from backend
        // We do this first as it's required for matching
        const countriesAction = await dispatch(fetchCountries());
        const countriesPayload = countriesAction.payload || [];

        // 2. If country is not already selected (e.g., first visit), auto-detect
        if (!selectedCountry?._id) {
          if (countriesPayload.length > 0) {
            const userCountryCode = await fetchUserCountryCode();
            const bestMatch = findBestCountryMatch(userCountryCode, countriesPayload);

            if (bestMatch) {
              dispatch(setSelectedCountry(bestMatch));
            }
          } else {
            // ROBUST FIX: If the API fails completely (e.g., CORS issue on different subdomain),
            // ensure the app doesn't hang forever or show a blank screen. Provide a fallback.
            dispatch(setSelectedCountry({ _id: "fallback-qa", code: "QA", name: "Qatar", isPrimary: true }));
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [dispatch, selectedCountry?._id]);

  return (
    <>
      {(loading || isAppLoading) && (
        <div className="app-loader">
          <img src={Logo} alt="Logo" />
        </div>
      )}
      <Router>
        <ScrollToTop />
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/*" element={<UserRoute />} />
          <Route path="/admin/*" element={<AdminRoute />} />
          <Route path="*" element={<NotFoundPage />} />;
        </Routes>
      </Router>
    </>
  );
}

export default App;
