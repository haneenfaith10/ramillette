import innerbg from "../../assets/images/banner1.jpg";
import "./InnerBanner.css";
export default function InnerBanner() {
  return (
    <>
      <div className="inner-banner">
        <div className="inner-bg">
          <img src={innerbg} alt="" />
        </div>
      </div>
    </>
  );
}
