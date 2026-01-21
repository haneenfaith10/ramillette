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
        const response = await axios.get(
          `https://ipinfo.io/json?token=${import.meta.env.VITE_LOCATION_KEY}`,
        );
        const data = response.data;
        const { country: userCountryCode } = data;
        const res = await dispatch(fetchCountries());

        if (
          res.meta.requestStatus === "fulfilled" &&
          res.payload.length > 0 &&
          !selectedCountry.code
        ) {
          const matchedCountry = res.payload.find(
            (country) =>
              country.code.toLowerCase() === userCountryCode.toLowerCase(),
          );

          if (matchedCountry) {
            dispatch(setSelectedCountry(matchedCountry));
          } else {
            const primaryCountry = res.payload.find(
              (country) => country.isPrimary === true,
            );

            if (primaryCountry) {
              dispatch(setSelectedCountry(primaryCountry));
            } else {
              console.warn("No primary country found, using first available");
              dispatch(setSelectedCountry(res.payload[0]));
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch IP location", error);
        // Fallback: fetch countries even if location fails
        await dispatch(fetchCountries());
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
