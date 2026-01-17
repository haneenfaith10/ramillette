import React from "react";
import shipping from "../../assets/images/travel.png";
import delivery from "../../assets/images/delivery-truck.png";
import safepayment from "../../assets/images/credit-card.png";
import "./Shipping.css";
import { useSelector } from "react-redux";

export default function Shipping() {
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const countries = useSelector((state) => state?.countries?.list || []);

  return (
    <div>
      <div className="">
        <div className="">
          <div className="shipping-row">
            <div className="shipping-col1">
              <div className="shipping-card">
                <div className="shipping-icon">
                  <img src={shipping} alt="" />
                </div>
                <div className="shipping-content">
                  <h3>{`SHIPPING all over ${
                    String(selectedCountry.name).charAt(0).toUpperCase() +
                    String(selectedCountry.name).slice(1)
                  }`}</h3>
                  <p>
                    {`Enjoy fast and reliable shipping to any location across ${countries
                      .map(
                        (c) => c.name.charAt(0).toUpperCase() + c.name.slice(1)
                      )
                      .join(", ")}.`}
                  </p>
                </div>
              </div>
            </div>
            <div className="shipping-col2">
              <div className="shipping-card">
                <div className="shipping-icon">
                  <img src={delivery} alt="" />
                </div>
                <div className="shipping-content">
                  <h3>Product Shipping</h3>
                  <p>
                    We offer reliable shipping on all orders, ensuring your
                    products reach you safely and on time.
                  </p>
                </div>
              </div>
            </div>
            <div className="shipping-col3">
              <div className="shipping-card">
                <div className="shipping-icon">
                  <img src={safepayment} alt="" />
                </div>
                <div className="shipping-content">
                  <h3>SECURITY PAYMENT</h3>
                  <p>Safe and secure transactions with advanced encryption.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
