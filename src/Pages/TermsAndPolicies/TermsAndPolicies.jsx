import Footer from "../../Components/Footer/Footer";
import NavBar from "../../Components/NavBar/NavBar";
import Topheader from "../../Components/TopHeader/TopHeader";
import "./TermsAndPolicies.css";

export default function TermsAndPolicies() {
  return (
    <div className="policy-main-container">
      <Topheader />
      <NavBar />
      <div className="policy-container">
        <h1 className="policy-title">Terms & Policies</h1>

        {/* Shipping Policy */}
        <section className="policy-section">
          <h2 className="terms-section-title">Shipping Policy</h2>
          <p>
            We offer fast and reliable shipping on all our perfumes. Once your
            order is confirmed, it will be processed within{" "}
            <strong>24–48 hours</strong>. Shipping typically takes
            <strong> 3–7 business days</strong>, depending on your location.
          </p>
          <p>
            You’ll receive a tracking link via email as soon as your package is
            shipped. All orders are securely packed to ensure the fragrance
            bottles arrive intact and in perfect condition.
          </p>
        </section>

        {/* Return Policy */}
        <section className="policy-section">
          <h2 className="terms-section-title">Return & Exchange Policy</h2>
          <p>
            Your satisfaction is our priority. If you are not completely happy
            with your purchase, you may return the product within{" "}
            <strong>7 days of delivery</strong> as long as it is unused, sealed,
            and in its original packaging.
          </p>
          <p>
            Due to the nature of perfumes, opened or used bottles cannot be
            returned. In case of a damaged or incorrect item, please contact our
            support within <strong>48 hours of receiving your order</strong>{" "}
            with images of the product.
          </p>
          <p>
            Refunds are processed within <strong>5–7 business days</strong>{" "}
            after inspection and approval.
          </p>
        </section>

        {/* Privacy Policy */}
        <section className="policy-section">
          <h2 className="terms-section-title">Privacy Policy</h2>
          <p>
            We respect your privacy and are committed to protecting your
            personal information. All data provided during registration or
            checkout is used solely for processing your order and enhancing your
            shopping experience.
          </p>
          <p>
            We do not sell or share your data with third parties. All
            transactions are encrypted and secured to keep your payment and
            personal information safe.
          </p>
          <p>
            For more detailed information, please refer to our complete privacy
            policy or contact our support team.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
}
