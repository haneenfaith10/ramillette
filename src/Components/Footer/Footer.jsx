import React, { useEffect, useState } from "react";
import "./Footer.css";
import footerlogo from "../../assets/images/logo.png";
import footinstagram from "../../assets/images/instgram-hover.svg";
import footinstagramhover from "../../assets/images/instgram.svg";
import footfacebook from "../../assets/images/facebook-hover.svg";
import footfacebookhover from "../../assets/images/facebook.svg";
import footyoutube from "../../assets/images/youtube-hover.svg";
import footyoutubehover from "../../assets/images/youtube.svg";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getSocialMediaLinks } from "../../services/socialLinksApiService";

export default function Footer() {
  const navigate = useNavigate();
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const { user } = useSelector((state) => state.user);
  const [socialLinks, setSocialLinks] = useState({});

  useEffect(() => {
    getSocialMediaLinks(setSocialLinks);
  }, []);

  return (
    <div className="footer-wrapper">
      <div className="footer-wrap-sec">
        <div className="container">
          <div className="footer-main-content">
            {/* Company Info Section */}
            <div className="footer-section footer-company">
              <div className="footer-logo">
                <img
                  src={footerlogo}
                  alt="Ramillette Logo"
                  onClick={() => navigate(`/${selectedCountry.code}`)}
                  style={{ cursor: "pointer" }}
                />
              </div>
              <p className="footer-description">
                Your trusted destination for premium fragrances. Discover luxury
                scents that define elegance and sophistication.
              </p>
              <div className="footer-social-icons">
                <a
                  href={socialLinks?.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <div className="footer-social">
                    <span className="social-icon">
                      <img src={footfacebookhover} alt="Facebook" />
                      <span className="hover-icon">
                        <img src={footfacebook} alt="Facebook" />
                      </span>
                    </span>
                  </div>
                </a>
                <a
                  href={socialLinks?.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <div className="footer-social">
                    <span className="social-icon">
                      <img src={footinstagramhover} alt="Instagram" />
                      <span className="hover-icon">
                        <img src={footinstagram} alt="Instagram" />
                      </span>
                    </span>
                  </div>
                </a>
                <a
                  href={socialLinks?.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <div className="footer-social">
                    <span className="social-icon">
                      <img src={footyoutubehover} alt="YouTube" />
                      <span className="hover-icon">
                        <img src={footyoutube} alt="YouTube" />
                      </span>
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="footer-section footer-quick-links">
              <h3 className="footer-section-title">Quick Links</h3>
              <ul className="footer-links-list">
                <li>
                  <Link to={`/${selectedCountry.code}`}>Home</Link>
                </li>
                <li>
                  <Link to={`/${selectedCountry.code}/product-list`}>
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to={`/${selectedCountry.code}/about`}>About Us</Link>
                </li>
                {user?.id && (
                  <li>
                    <Link to={`/${selectedCountry.code}/profile/wishlist`}>
                      My Wishlist
                    </Link>
                  </li>
                )}
                {user?.id && (
                  <li>
                    <Link to={`/${selectedCountry.code}/profile/orders`}>
                      My Orders
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Customer Service Section */}
            <div className="footer-section footer-customer-service">
              <h3 className="footer-section-title">Customer Service</h3>
              <ul className="footer-links-list">
                <li>
                  <Link to={`/${selectedCountry.code}/contact`}>
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to={`/${selectedCountry.code}/terms-and-policies`}>
                    Terms & Policies
                  </Link>
                </li>
                {user?.id && (
                  <li>
                    <Link to={`/${selectedCountry.code}/profile/addresses`}>
                      My Addresses
                    </Link>
                  </li>
                )}
                {user?.id && (
                  <li>
                    <Link to={`/${selectedCountry.code}/profile/details`}>
                      My Account
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Legal & Info Section */}
            <div className="footer-section footer-legal">
              <h3 className="footer-section-title">Legal & Info</h3>
              <ul className="footer-links-list">
                <li>
                  <Link to={`/${selectedCountry.code}/terms-and-policies`}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to={`/${selectedCountry.code}/terms-and-policies`}>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to={`/${selectedCountry.code}/terms-and-policies`}>
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link to={`/${selectedCountry.code}/terms-and-policies`}>
                    Shipping Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-copyright">
              <p>
                © {new Date().getFullYear()} Ramillette. All rights reserved.
              </p>
            </div>
            <div className="footer-payment-info">
              <p>Secure Payment • Fast Delivery • 24/7 Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
