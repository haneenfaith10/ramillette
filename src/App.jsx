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
  const isAppLoading = useSelector((state) => state.user.isAppLoading);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        setLoading(true);

        // Helper to fetch with timeout
        const fetchWithTimeout = (url, timeout = 3000) => {
          return Promise.race([
            axios.get(url),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), timeout),
            ),
          ]);
        };

        // Fire both requests in parallel
        const [locationRes, countriesRes] = await Promise.allSettled([
          fetchWithTimeout(
            `https://ipinfo.io/json?token=${import.meta.env.VITE_LOCATION_KEY}`,
          ),
          dispatch(fetchCountries()),
        ]);

        const countriesPayload =
          countriesRes.status === "fulfilled" ? countriesRes.value.payload : [];

        if (!selectedCountry.code && countriesPayload?.length > 0) {
          let userCountryCode = null;
          if (locationRes.status === "fulfilled") {
            userCountryCode = locationRes.value.data.country;
          }

          const matchedCountry = userCountryCode
            ? countriesPayload.find(
                (c) => c.code.toLowerCase() === userCountryCode.toLowerCase(),
              )
            : null;

          if (matchedCountry) {
            dispatch(setSelectedCountry(matchedCountry));
          } else {
            // Fallback to first available country
            dispatch(setSelectedCountry(countriesPayload[0]));
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocation();
  }, [dispatch]);

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
