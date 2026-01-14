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

function App() {
  const dispatch = useDispatch();
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const maxWaitTime = 2000; // Reduced to 2 seconds for faster mobile loading
    const startTime = Date.now();

    const initializeApp = async () => {
      // If country already exists in persisted state, use it immediately
      if (selectedCountry && selectedCountry.code) {
        if (isMounted) {
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, Math.min(500, maxWaitTime - elapsed));
          setTimeout(() => {
            if (isMounted) {
              setLoading(false);
            }
          }, remainingTime);
        }
        return;
      }

      // Try to fetch country data
      try {
        // First, try to get countries (this is the critical API)
        const countriesRes = await dispatch(fetchCountries());

        if (
          isMounted &&
          countriesRes.meta?.requestStatus === "fulfilled" &&
          countriesRes.payload?.length > 0
        ) {
          let countryToSet = null;

          // Try to get user location (non-blocking, with timeout)
          try {
            const locationResponse = await axios.get(
              `https://ipinfo.io/json?token=${import.meta.env.VITE_LOCATION_KEY}`,
              { timeout: 2000 }
            );
            
            const userCountryCode = locationResponse.data?.country;
            if (userCountryCode) {
              const matchedCountry = countriesRes.payload.find(
                (country) =>
                  country.code?.toLowerCase() === userCountryCode.toLowerCase()
              );
              if (matchedCountry) {
                countryToSet = matchedCountry;
              }
            }
          } catch (locationError) {
            // Location detection failed - not critical, continue
            console.log("Location detection skipped");
          }

          // If no match from location, use primary or first country
          if (!countryToSet) {
            countryToSet = countriesRes.payload.find(
              (country) => country.isPrimary === true
            ) || countriesRes.payload[0];
          }

          if (countryToSet && isMounted) {
            dispatch(setSelectedCountry(countryToSet));
          }
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
        // App will still work - just without country selection
      } finally {
        // Always stop loading after max time, regardless of API results
        if (isMounted) {
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, maxWaitTime - elapsed);
          setTimeout(() => {
            if (isMounted) {
              setLoading(false);
            }
          }, remainingTime);
        }
      }
    };

    initializeApp();

    // Absolute safety timeout - always stop loading
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, maxWaitTime);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [dispatch, selectedCountry?.code]);

  // Always render the app, even if loading - this prevents blank screens on mobile
  return (
    <>
      {loading && (
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
