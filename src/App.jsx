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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const maxWaitTime = 3000; // Maximum 3 seconds wait
    const startTime = Date.now();

    const fetchUserLocation = async () => {
      try {
        // Try to fetch location with timeout
        const locationPromise = axios.get(
          `https://ipinfo.io/json?token=${import.meta.env.VITE_LOCATION_KEY}`,
          { timeout: 3000 }
        );
        
        const response = await locationPromise;
        const data = response.data;
        const { country: userCountryCode } = data;
        
        const res = await dispatch(fetchCountries());
        if (
          isMounted &&
          res.meta.requestStatus === "fulfilled" &&
          res.payload.length > 0 &&
          !selectedCountry.code
        ) {
          const matchedCountry = res.payload.find(
            (country) =>
              country.code.toLowerCase() === userCountryCode.toLowerCase()
          );

          if (matchedCountry) {
            dispatch(setSelectedCountry(matchedCountry));
          } else {
            const primaryCountry = res.payload.find(
              (country) => country.isPrimary === true
            );

            if (primaryCountry) {
              dispatch(setSelectedCountry(primaryCountry));
            } else if (res.payload[0]) {
              dispatch(setSelectedCountry(res.payload[0]));
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch IP location", error);
        // Fallback: try to get countries without location
        try {
          const res = await dispatch(fetchCountries());
          if (
            isMounted &&
            res.meta.requestStatus === "fulfilled" &&
            res.payload.length > 0 &&
            !selectedCountry.code
          ) {
            const primaryCountry = res.payload.find(
              (country) => country.isPrimary === true
            );
            if (primaryCountry) {
              dispatch(setSelectedCountry(primaryCountry));
            } else if (res.payload[0]) {
              dispatch(setSelectedCountry(res.payload[0]));
            }
          }
        } catch (fallbackError) {
          console.error("Failed to fetch countries", fallbackError);
        }
      } finally {
        if (isMounted) {
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, maxWaitTime - elapsed);
          setTimeout(() => {
            if (isMounted) {
              setLoading(false);
              setInitialized(true);
            }
          }, remainingTime);
        }
      }
    };

    if (!selectedCountry || !selectedCountry.code) {
      fetchUserLocation();
    } else {
      // If country already exists, just wait a minimal time for smooth transition
      setTimeout(() => {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }, 300);
    }

    // Safety timeout - always stop loading after max time
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
        setInitialized(true);
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
