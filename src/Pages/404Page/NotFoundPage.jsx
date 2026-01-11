import { Link } from "react-router-dom";
import "./NotFoundPage.css";
import PerfumeSvg from "../../assets/svg/perfume.svg";
import { useSelector } from "react-redux";

export default function NotFoundPage() {
  const selectedCountry = useSelector((state) => state.user.selectedCountry);

  return (
    <div className="notfound-container">
      <div className="notfound-box">
        <img
          src={PerfumeSvg}
          alt="Perfume Not Found"
          className="notfound-image"
        />

        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Oops! Scent Not Found</h2>
        <p className="notfound-text">
          The fragrance you're looking for might have evaporated into thin air.
          Let’s get you back to a place filled with aromas.
        </p>

        <div className="notfound-buttons">
          <Link to={`/${selectedCountry.code}/`} className="btn-primary">
            Back to Home
          </Link>
          <Link
            to={`/${selectedCountry.code}/product-list`}
            className="btn-outline"
          >
            {/* <Sparkles size={18} /> */}
            Explore Perfumes
          </Link>
        </div>
      </div>
    </div>
  );
}
