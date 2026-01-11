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
    const fetchUserLocation = async () => {
      try {
        const response = await axios.get(
          `https://ipinfo.io/json?token=${import.meta.env.VITE_LOCATION_KEY}`
        );
        const data = response.data;
        const { country: userCountryCode } = data;
        dispatch(fetchCountries()).then((res) => {
          if (
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
              const primaryCountry = countries.find(
                (country) => country.isPrimary === true
              );

              if (primaryCountry) {
                dispatch(setSelectedCountry(primaryCountry));
              } else {
                console.warn("No primary country found, using first available");
                dispatch(setSelectedCountry(countries[0]));
              }
            }
          }
        });
      } catch (error) {
        console.error("Failed to fetch IP location", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
    if (!selectedCountry || !selectedCountry.code) {
      fetchUserLocation();
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [dispatch, selectedCountry?.code]);

  if (loading) {
    return (
      <div className="app-loader">
        <img src={Logo} alt="Logo" />
      </div>
    );
  }

  return (
    <>
      {!loading && (
        <Router>
          <ScrollToTop />
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/*" element={<UserRoute />} />
            <Route path="/admin/*" element={<AdminRoute />} />
            <Route path="*" element={<NotFoundPage />} />;
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;
