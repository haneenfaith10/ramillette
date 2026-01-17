import React, { useEffect } from "react";
import "./TopHeader.css";
import mail from "../../assets/images/mail.svg";
import instagram from "../../assets/images/instgram.svg";
import instagramhover from "../../assets/images/instgram-blue.svg";
import facebook from "../../assets/images/facebook.svg";
import facebookhover from "../../assets/images/facebook-blue.svg";
import youtube from "../../assets/images/youtube.svg";
import youtubehover from "../../assets/images/youtube-blue.svg";
import { useState } from "react";
import { getSettingsData } from "../../services/settingsApiService";
import { useDispatch, useSelector } from "react-redux";
// import { useLocation } from "react-router-dom";
import {
  setSelectedCountry,
  updateCart,
  updateUserWishList,
} from "../../redux/slices/userSlice";
import LocationImage from "../../assets/images/location.svg";
import { getUserCountrySpecificData } from "../../services/userApiServices";
import { CountryAlerts } from "../../services/alertApiService";

export default function Topheader() {
  const dispatch = useDispatch();
  // const location = useLocation();
  const [settingData, setSettingsData] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState({});
  const [collectionAlerts, setCollectionAlerts] = useState([]);
  const countries = useSelector((state) => state.countries.list);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const token = localStorage.getItem("remilletteTkn");
  const [alertIndex, setAlertIndex] = useState(0);

  useEffect(() => {
    getSettingsData(setSettingsData, setSocialLinks);
  }, []);

  useEffect(() => {
    if (selectedCountry._id) {
      CountryAlerts(selectedCountry._id, setCollectionAlerts);
    }
  }, [selectedCountry._id]);

  useEffect(() => {
    if (collectionAlerts.length === 0) return;

    const interval = setInterval(() => {
      setAlertIndex((prev) => (prev + 1) % collectionAlerts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [collectionAlerts]);

  useEffect(() => {
    if (token && token.length > 0) {
      (async () => {
        const response = await getUserCountrySpecificData(
          selectedCountry._id,
          token
        );
        if (response) {
          dispatch(updateCart({ cart: response.cart }));
          dispatch(updateUserWishList({ user: response.wishlist.products }));
        }
      })();
    }
  }, [selectedCountry._id, dispatch, token]);

  const handleCountryChange = async (newCountry) => {
    dispatch(setSelectedCountry(newCountry));
  };

  // when clicks the location need to show the map of that location
  const openInGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(settingData?.companyAddress);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, "_blank");
  };

  // const selectedCountryTag =
  //   Array.isArray(settingData?.tag) &&
  //   settingData.tag.find((t) => t.country === selectedCountry._id)?.value;

  return (
    <>
      <div className="top-header-sec">
        <div className="container">
          <div className="top-header-row">
            <div className="topheader-col1">
              <div className="store-location">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openInGoogleMaps();
                  }}
                >
                  <span>
                    <img src={LocationImage} alt="" />
                  </span>
                  <span>{settingData?.companyLocation}</span>
                </a>
              </div>
              <div className="store-mail">
                <a
                  href={`mailto:${settingData?.companyEmail}`}
                  className="email-link"
                >
                  <span>
                    <img src={mail} alt="Mail Icon" />
                  </span>
                  <span>{settingData?.companyEmail}</span>
                </a>
              </div>
            </div>
            {/* <div className="top-header-col2">
              <p>
                <a href="#">New Collection Alert:{selectedCountryTag}</a>
              </p>
            </div> */}
            <div className="top-header-col2">
              <div key={alertIndex} className="flipping-text top-header-col2">
                {collectionAlerts[alertIndex]?.content}
              </div>
            </div>
            <div className="top-header-col3">
              <div className="currency-selector">
                <button
                  className="currency-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="flag">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}${
                        selectedCountry.flagUrl
                      }`}
                      alt=""
                    />
                  </span>
                  <span className="code">{selectedCountry.currency}</span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    {countries.map((currency) => (
                      <div
                        key={currency.code}
                        className="dropdown-item"
                        onClick={() => {
                          setDropdownOpen(false);
                          handleCountryChange(currency);
                        }}
                      >
                        <span className="flag">
                          <img
                            src={`${import.meta.env.VITE_BASE_URL}${
                              currency.flagUrl
                            }`}
                            alt=""
                          />
                        </span>
                        <span className="code">{currency.currency}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="top-header-social">
                <div className="header-social-icons">
                  <div className="header-social">
                    <a href={socialLinks?.facebook} target="_blank">
                      <span className="social-icon">
                        <img src={facebook} alt="" />
                        <span className="hover-icon">
                          <img src={facebookhover} alt="" />
                        </span>
                      </span>
                    </a>
                  </div>
                  <div className="header-social">
                    <a href={socialLinks?.instagram} target="_blank">
                      <span className="social-icon">
                        <img src={instagram} alt="" />
                        <span className="hover-icon">
                          <img src={instagramhover} alt="" />
                        </span>
                      </span>
                    </a>
                  </div>
                  <div className="header-social">
                    <a href={socialLinks?.youtube} target="_blank">
                      <span className="social-icon">
                        <img src={youtube} alt="" />
                        <span className="hover-icon">
                          <img src={youtubehover} alt="" />
                        </span>
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
