import { useFormik } from "formik";
import "./CheckoutAddress.css";
import { useEffect, useState } from "react";
import { getAddresses } from "../../services/userApiServices";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  setCheckoutAddress,
  updateSubTotalAmount,
} from "../../redux/slices/userSlice";
import { calculateTotalPriceWithTax } from "../../utils/calculation";
import { getTaxByCountry } from "../../services/taxApiServices";
import { getActiveCountries } from "../../services/configApiService";
import { State, City } from "country-state-city";

/* ======================================================
   ✅ Checkout Summary Card
====================================================== */
export function CheckoutSummeryCard({ cartItem }) {
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [tax, setTax] = useState("");
  const [taxName, setTaxName] = useState("");

  useEffect(() => {
    if (selectedCountry._id) {
      (async () => {
        const response = await getTaxByCountry(selectedCountry._id);
        if (response) {
          setTax(response?.taxPercentage);
          setTaxName(response?.taxName);
        }
      })();
    }
  }, [selectedCountry._id]);

  // ✅ Subtotal using Redux discountedPrice (precomputed in Checkout)
  // const subtotal = cartItem?.cart?.reduce((acc, item) => {
  //   const effectivePrice =
  //     item.discountedPrice ?? item.selectedVariant?.price ?? 0;
  //   return acc + effectivePrice * item.qty;
  // }, 0);
  const subtotal = cartItem?.cart?.reduce(
    (acc, item) => acc + getEffectivePrice(item) * item.qty,
    0
  );

  const { totalPrice, taxAmount } = calculateTotalPriceWithTax(subtotal, tax);

  function getEffectivePrice(item) {
    console.log(item, "item");
    const basePrice =
      item.selectedVariant?.price || item.productId?.basePrice || 0;
    const offer = item.selectedOffer;

    let finalPrice = basePrice;

    if (offer) {
      if (offer.offerType === "bogo") {
        finalPrice = basePrice - (offer.discountValue / 100) * basePrice;
      } else if (offer.discountType === "percent") {
        finalPrice = basePrice - (offer.discountValue / 100) * basePrice;
      } else if (offer.discountType === "flat") {
        finalPrice = Math.max(basePrice - offer.discountValue, 0);
      }
    } else if (item.discountedPrice > 0) {
      finalPrice = item.discountedPrice;
    }

    return finalPrice;
  }

  return (
    <div className="checkout-address-order-summary">
      <h3>Order Summary</h3>
      <div className="checkout-address-order-summery-cart">
        {cartItem?.cart?.length > 0 ? (
          cartItem.cart.map((item) => {
            const offer = item.selectedOffer;
            const variantPrice = item.selectedVariant?.price || 0;
            const discountedPrice = item.discountedPrice ?? variantPrice;

            return (
              <div
                key={item?.productId?._id || item?.productId}
                className="checkout-address-order-summery-cart-item"
              >
                <img
                  src={`${import.meta.env.VITE_BASE_URL}/${
                    item?.productImages?.[0]?.path
                  }`}
                  alt="cart product"
                />

                <div className="checkout-address-order-summery-cart-item-details">
                  <p className="cart-item-product-name">
                    {item?.productId?.productName || item?.productName}
                  </p>
                  <p style={{ fontSize: "14px", marginBottom: "2px" }}>
                    Variant: {item.selectedVariant?.variantName}
                  </p>

                  {/* ✅ Offer / Discount Info */}
                  {/* {offer ? (
                    <p className="cart-item-offer-info">
                      <strong>Offer Applied:</strong> {offer.title} (
                      {offer.discountType === "percent"
                        ? `${offer.discountValue}% OFF`
                        : `${selectedCountry.priceLabel}${offer.discountValue} OFF`}
                      )
                    </p>
                  ) : item.productId?.productDiscount ? (
                    <p className="cart-item-offer-info">
                      Product Discount: {item.productId.productDiscount}% OFF
                    </p>
                  ) : null} */}
                  {offer ? (
                    <>
                      {offer.offerType === "bogo" ? (
                        <p className="cart-item-offer-info">
                          <strong>BOGO Applied:</strong> Buy {offer.buyQuantity}{" "}
                          Get {offer.discountValue}% OFF
                        </p>
                      ) : (
                        <p className="cart-item-offer-info">
                          <strong>Offer Applied:</strong> {offer.title} (
                          {offer.discountType === "percent"
                            ? `${offer.discountValue}% OFF`
                            : `${selectedCountry.priceLabel}${offer.discountValue} OFF`}
                          )
                        </p>
                      )}
                    </>
                  ) : item.productId?.productDiscount ? (
                    <p className="cart-item-offer-info">
                      Product Discount: {item.productId.productDiscount}% OFF
                    </p>
                  ) : null}

                  {/* ✅ Discounted vs Original Price */}
                  {/* <p className="cart-item-product-price">
                    {selectedCountry.priceLabel}
                    {discountedPrice.toFixed(2)} × {item.qty}
                  </p> */}
                  <p className="cart-item-product-price">
                    {selectedCountry.priceLabel}
                    {getEffectivePrice(item).toFixed(2)} × {item.qty}
                  </p>
                  {(offer || item.productId?.productDiscount > 0) && (
                    <p className="cart-item-product-price-discount">
                      <strike style={{ color: "red", fontSize: "12px" }}>
                        {selectedCountry.priceLabel}
                        {(variantPrice * item.qty).toFixed(2)}
                      </strike>
                    </p>
                  )}
                </div>

                {/* <p className="cart-item-final-total">
                  {selectedCountry.priceLabel}
                  {(discountedPrice * item.qty).toFixed(2)}
                </p> */}
                <p className="cart-item-final-total">
                  {selectedCountry.priceLabel}
                  {(getEffectivePrice(item) * item.qty).toFixed(2)}
                </p>
              </div>
            );
          })
        ) : (
          <p>No items in cart.</p>
        )}
      </div>

      {/* ✅ Totals */}
      <div className="checkout-address-order-summery-total">
        <div className="checkout-address-order-total-price-section">
          <p>Total Price:</p>
          <p>
            {selectedCountry.priceLabel}
            {subtotal.toFixed(2)}
          </p>
        </div>

        <div className="checkout-address-order-tax-section">
          <p>Tax ({taxName || "Tax"}):</p>
          <p>
            {tax}% ({selectedCountry.priceLabel}
            {taxAmount.toFixed(2)})
          </p>
        </div>

        <div className="checkout-address-order-total-price-section">
          <p>Subtotal (with Tax):</p>
          <p>
            {selectedCountry.priceLabel}
            {totalPrice.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   ✅ Checkout Address Component
====================================================== */
export default function CheckoutAddress() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [addresses, setAddresses] = useState([]);
  const user = useSelector((state) => state.user.user);
  const cartItem = useSelector((state) => state.user.checkout);
  const cartItems = useSelector((state) => state.user.checkout.cart);
  const userSelectedCountry = useSelector(
    (state) => state.user.selectedCountry
  );
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [tax, setTax] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (user.id) getAddresses(user.id, setAddresses);
  }, [user.id]);

  useEffect(() => {
    (async () => {
      const response = await getActiveCountries();
      if (response) setCountries(response);
    })();
  }, []);

  useEffect(() => {
    if (userSelectedCountry._id) {
      (async () => {
        const response = await getTaxByCountry(userSelectedCountry._id);
        if (response) setTax(response?.taxPercentage);
      })();
    }
  }, [cartItems, userSelectedCountry._id]);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    address: Yup.string().required("Address is required"),
    country: Yup.string().required("Country is required"),
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    zipCode: Yup.string().required("Zip code is required"),
  });

  const { values, errors, handleSubmit, setErrors } = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
    },
    validationSchema,
    onSubmit: () => submitCheckoutAddress(),
  });

  // ✅ Use discountedPrice from Redux for total
  function getFinalSubtotal() {
    return cartItems?.reduce((total, item) => {
      const effectivePrice =
        item.discountedPrice ?? item.selectedVariant?.price ?? 0;
      return total + effectivePrice * item.qty;
    }, 0);
  }

  // ✅ Proceed to Payment
  function handlePayment() {
    const subtotal = getFinalSubtotal();
    const { totalPrice } = calculateTotalPriceWithTax(subtotal, tax);
    dispatch(updateSubTotalAmount({ totalAmount: totalPrice }));
    navigate(`/${userSelectedCountry.code}/checkout/payment`);
  }

  function submitCheckoutAddress() {
    const obj = selectedAddress
      ? {
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName,
          email: selectedAddress.email,
          phoneNumber: selectedAddress.phone,
          address: selectedAddress.streetAddress,
          country: selectedAddress.country,
          state: selectedAddress.state,
          city: selectedAddress.city,
          zipCode: selectedAddress.zip,
        }
      : { ...values };

    dispatch(setCheckoutAddress(obj));
    handlePayment();
  }

  useEffect(() => {
    setStates(State.getStatesOfCountry(selectedCountry.toUpperCase()));
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      setCities(
        City.getCitiesOfState(
          selectedCountry.toUpperCase(),
          selectedState.toUpperCase()
        )
      );
    }
  }, [selectedState, selectedCountry]);

  function handleAddressChange(address) {
    setSelectedAddress(address);
    setShowAddressForm(false);
    setErrors({});
  }

  return (
    <div className="checkout-address-container">
      <div className="container">
        <div className="checkout-address-content-section">
          <div className="checkout-address-main-content">
          <h2 className="checkout-address-title">Address</h2>

          {/* ✅ Saved Addresses */}
          {addresses?.length > 0 ? (
            <>
              <div className="checkout-address-address-list-container">
                <h3 className="checkout-address-section-title">Saved Addresses</h3>
                <div className="checkout-address-address-list">
                  {addresses.map((address, index) => (
                    <div
                      className={`checkout-address-address-item ${
                        selectedAddress === address ? "selected" : ""
                      }`}
                      key={index}
                      onClick={() => handleAddressChange(address)}
                    >
                      <div className="checkout-address-radio-wrapper">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === address}
                          readOnly
                        />
                        <span className="checkout-address-radio-label">
                          {selectedAddress === address ? "Selected" : "Select"}
                        </span>
                      </div>
                      <div className="checkout-address-details">
                        <p className="checkout-address-name">
                          {address.firstName} {address.lastName}
                        </p>
                        <p className="checkout-address-text">
                          {address.streetAddress}
                        </p>
                        <p className="checkout-address-text">
                          {address.city}, {address.state}, {address.country}
                        </p>
                        <p className="checkout-address-text">
                          Zip: {address.zip}
                        </p>
                        <p className="checkout-address-phone">
                          Phone: {address.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="checkout-address-add-button-wrapper">
                <button
                  type="button"
                  className="checkout-address-add-btn"
                  onClick={() =>
                    navigate(`/${userSelectedCountry.code}/profile/addresses`)
                  }
                >
                  + Add New Address
                </button>
              </div>

              {/* ✅ Navigation Buttons - Desktop */}
              <div className="checkout-address-submit-button-wrapper checkout-address-buttons-desktop">
                <button
                  type="button"
                  className="checkout-address-back-btn"
                  onClick={() => navigate(`/${userSelectedCountry.code}/checkout`)}
                >
                  <MdKeyboardArrowLeft />
                  Back to Checkout
                </button>
                <button
                  type="submit"
                  className="checkout-address-proceed-btn"
                  onClick={() =>
                    selectedAddress ? submitCheckoutAddress() : handleSubmit()
                  }
                  disabled={!selectedAddress}
                >
                  Proceed to Payment
                  <MdKeyboardArrowRight />
                </button>
              </div>
            </>
          ) : (
            <div className="checkout-address-empty-state">
              <div className="checkout-address-empty-content">
                <p className="checkout-address-empty-text">
                  No saved addresses found
                </p>
                <p className="checkout-address-empty-subtext">
                  Please add an address to continue with checkout
                </p>
                <button
                  type="button"
                  className="checkout-address-add-btn-primary"
                  onClick={() =>
                    navigate(`/${userSelectedCountry.code}/profile/addresses`)
                  }
                >
                  + Add Address
                </button>
              </div>
            </div>
          )}
          </div>

          <CheckoutSummeryCard cartItem={cartItem} />
        </div>
      </div>
    </div>
  );
}
