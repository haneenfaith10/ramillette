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
  const [socialLinks, setSocialLinks] = useState({});

  useEffect(() => {
    getSocialMediaLinks(setSocialLinks);
  }, []);

  return (
    <div>
      <div className="footer-wrap-sec">
        <div className="footer-row">
          <div className="footer-col1">
            <div className="footer-logo">
              <img
                src={footerlogo}
                alt="logo"
                onClick={() => navigate(`/${selectedCountry.code}`)}
              />
            </div>
            <div className="footer-header-social">
              <div className="footer-social-icons">
                <div className="footer-social">
                  <a href={socialLinks?.facebook} target="_blank">
                    <span className="social-icon">
                      <img src={footfacebookhover} alt="" />
                      <span className="hover-icon">
                        <img src={footfacebook} alt="" />
                      </span>
                    </span>
                  </a>
                </div>
                <div className="footer-social">
                  <a href={socialLinks?.instagram} target="_blank">
                    <span className="social-icon">
                      <img src={footinstagramhover} alt="" />
                      <span className="hover-icon">
                        <img src={footinstagram} alt="" />
                      </span>
                    </span>
                  </a>
                </div>
                <div className="footer-social">
                  <a href={socialLinks?.youtube} target="_blank">
                    <span className="social-icon">
                      <img src={footyoutubehover} alt="" />
                      <span className="hover-icon">
                        <img src={footyoutube} alt="" />
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-col2">
            <div className="footer-menu">
              <ul>
                <li>
                  <Link to={`/${selectedCountry.code}/terms-and-policies`}>Terms & policies</Link>
                </li>
                {/* <li>
                  <a href="#">FAQ</a>
                </li> */}
                <li>
                  <Link to={`/${selectedCountry.code}/contact`}>
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to={`/${selectedCountry.code}/about`}>About Us</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
