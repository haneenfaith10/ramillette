import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Topheader from "../../Components/TopHeader/TopHeader";
import NavBar from "../../Components/NavBar/NavBar";
import "./PurchaseSingleItem.css";
import {
  MdKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import {
  getAddresses,
  isProductAvailable,
} from "../../services/userApiServices";
import { useSelector } from "react-redux";

import { useFormik } from "formik";
import * as Yup from "yup";
import { getActiveCountries } from "../../services/configApiService";
import { State, City } from "country-state-city";
import {
  calculateTotalPriceWithTax,
  getDiscountedPrice,
} from "../../utils/calculation";
import { getTaxByCountry } from "../../services/taxApiServices";
import Radio from "@mui/material/Radio";

export default function PurchaseSingleItem() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const [addresses, setAddresses] = useState([]);
  const userId = useSelector((state) => state.user.user.id);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);
  const [tax, setTax] = useState("");
  const userSelectedCountry = useSelector(
    (state) => state.user.selectedCountry
  );
  const [productAvailableError, setProductAvailableError] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    (async () => {
      const response = await getTaxByCountry(userSelectedCountry._id);
      if (response) {
        setTax(response);
      }
    })();
  }, [userSelectedCountry._id]);

  function checkProductAvailability() {
    if (selectedVariant?._id) {
      isProductAvailable(
        product._id,
        product.quantity,
        selectedVariant._id,
        setProductAvailableError
      );
    }
  }

  useEffect(() => {
    if (selectedVariant?._id) {
      checkProductAvailability();
    }
  }, [product._id, product.quantity, selectedVariant?._id]);

  const countryVariants = useMemo(() => {
    return product.countryVariants?.[userSelectedCountry._id] || [];
  }, [product.countryVariants, userSelectedCountry._id]);


  useEffect(() => {
    if (countryVariants.length > 0 && !selectedVariant) {
      setSelectedVariant(countryVariants[0]);
    }
  }, [countryVariants, selectedVariant]);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters"),
    lastName: Yup.string().nullable(),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .when("country", {
        is: (country) => country === "India" || country === "IN",
        then: (schema) =>
          schema.matches(
            /^\d{10}$/,
            "Phone number must be exactly 10 digits for India"
          ),
        otherwise: (schema) =>
          schema
            .min(6, "Phone number must be at least 6 digits")
            .max(15, "Phone number is too long"),
      }),
    address: Yup.string()
      .required("Address is required")
      .min(5, "Address must be at least 5 characters"),
    country: Yup.string().required("Country is required"),
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    zipCode: Yup.string()
      .required("Zip code is required")
      .matches(/^\d{5,6}$/, "Zip code must be 5 or 6 digits"),
  });
  const formik = useFormik({
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
      note: "",
    },
    validationSchema,
    onSubmit: (values) => {
      checkProductAvailability();
      navigate(`/${userSelectedCountry.code}/payment-single-checkout`, {
        state: { product, address: values, selectedVariant },
      });
    },
  });

  useEffect(() => {
    getAddresses(userId, setAddresses);
    (async () => {
      const response = await getActiveCountries();
      if (response) {
        setCountries(response);
      }
    })();
  }, [userId]);

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

  if (!product) {
    return (
      <p className="no-product-msg">
        No product data found. Please go back and select a product.
      </p>
    );
  }

  // Base URL for images if needed
  const baseUrl = import.meta.env.VITE_BASE_URL || "";

  // Function to select saved address and update form values
  const handleAddressSelect = (address) => {
    setSelectedAddressId(address._id);
    formik.setFieldValue("firstName", address.firstName || "");
    formik.setFieldValue("lastName", address.lastName || "");
    formik.setFieldValue("email", address.email || "");
    formik.setFieldValue("phoneNumber", address.phone || "");
    formik.setFieldValue("address", address.streetAddress || "");
    formik.setFieldValue("zipCode", address.zip || "");
    // Update country
    const matchedCountry = countries.find(
      (c) => c.name.toLowerCase() === address.country.toLowerCase()
    );

    if (matchedCountry) {
      setSelectedCountry(matchedCountry.code);
      formik.setFieldValue("country", matchedCountry.name);
    }

    // Update state
    const matchedState = states.find(
      (s) => s.name.toLowerCase() === address.state.toLowerCase()
    );
    if (matchedState) {
      setSelectedState(matchedState.isoCode);
      formik.setFieldValue("state", matchedState.name);
    }

    // Update city
    formik.setFieldValue("city", address.city || "");
  };

  const controlProps = (item) => ({
    value: item,
    name: "color-radio-button-demo",
    inputProps: { "aria-label": item },
  });

  return (
    <div className="checkout-single-main-container">
      <Topheader />
      <NavBar />
      <div className="checkout-page">
        <h2>Checkout</h2>

        <div className="checkout-content">
          {/* Product Info */}
          <section className="product-details">
            <h3>Product Details</h3>
            <div className="product-images">
              {product.productImages?.map((img, i) => (
                <img
                  key={i}
                  src={
                    img.path.startsWith("http")
                      ? img.path
                      : `${baseUrl}/${img.path}`
                  }
                  alt={`${product.productName} image ${i + 1}`}
                />
              ))}
            </div>

            <div className="product-info-text">
              <p>
                <strong>Name:</strong> {product.productName}
              </p>
              <p>
                <strong>Short Name:</strong> {product.productShortName}
              </p>
              <p>
                <strong>Price:</strong> ₹
                {selectedVariant &&
                  selectedVariant.price &&
                  getDiscountedPrice(
                    selectedVariant.price,
                    product.productDiscount
                  )}
              </p>
              <p>
                <strong>Discount:</strong> {product.productDiscount}% off
              </p>
              <p>
                <strong>Quantity:</strong> {product.quantity}
              </p>
              <p>
                <strong>Rating:</strong> {product.productRating} ⭐
              </p>
              <p>
                <strong>Stock:</strong> {product.productStock} available
              </p>
              <p>
                <strong>Description:</strong> {product.productDescription}
              </p>
              <p>
                <strong>Benefits:</strong> {product.productBenefits?.join(", ")}
              </p>
              <p>
                <strong>Use Cases:</strong> {product.productUseCase?.join(", ")}
              </p>
              <p>
                <strong>Ingredients:</strong> {product.productIngredients}
              </p>
              <p>
                <strong>Other Info:</strong> {product.productOtherInfo}
              </p>
              <div className="variant-selection">
                <h4 style={{ fontWeight: 700 }}>Select Variant:</h4>
                <ul className="variant-list">
                  {countryVariants.map((variant, index) => {
                    const discountedPrice = getDiscountedPrice(
                      variant.price,
                      product.productDiscount
                    );
                    return (
                      <li
                        key={index}
                        className={`variant-item ${
                          selectedVariant?._id === variant._id ? "active" : ""
                        }`}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        <strong>{variant.variantName}</strong>
                        <p>Price: ₹{discountedPrice}</p>
                        {variant.stock <= 10 && (
                          <p
                            style={{
                              color: variant.stock <= 3 ? "#ff4d4d" : "#f59e0b",
                              fontWeight: 500,
                            }}
                          >
                            {variant.stock > 3
                              ? "Only few remaining"
                              : `Only ${variant.stock} remaining`}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            {productAvailableError ? (
              <p style={{ color: "red" }}>Product is unavailable</p>
            ) : (
              <p style={{ color: "Green" }}>Product is available</p>
            )}
            <div className="checkout-single-price-info">
              <h4>Price Details</h4>
              <div>
                <p>
                  Price per Item : ₹{selectedVariant && selectedVariant.price}
                  /item
                </p>
                <p>Discount in (%): {product.productDiscount}%</p>
                <p>
                  Discounted Price : ₹
                  {selectedVariant &&
                    selectedVariant.price &&
                    getDiscountedPrice(
                      selectedVariant.price,
                      product.productDiscount
                    )}
                  / item
                </p>
                <p>
                  Total Amount :
                  {selectedVariant &&
                    selectedVariant.price &&
                    getDiscountedPrice(
                      selectedVariant.price,
                      product.productDiscount
                    ) * product.quantity}
                </p>
                <p>Tax in percentage : {tax.taxPercentage}%</p>
                <p>
                  Sub Total :
                  {selectedVariant &&
                    calculateTotalPriceWithTax(
                      getDiscountedPrice(
                        selectedVariant.price,
                        product.productDiscount
                      ) * product.quantity,
                      tax.taxPercentage
                    ).totalPrice}
                </p>
              </div>
            </div>
          </section>

          {/* Address Form */}
          <section className="address-section">
            <h3>Shipping Address</h3>
            {addresses.length > 0 && (
              <div className="checkout-saved-addresses">
                <h4>Saved Addresses</h4>
                <ul>
                  {addresses.map((address) => (
                    <li
                      className="checkout-address-address-item"
                      key={address._id}
                      onClick={() => handleAddressSelect(address)}
                    >
                      <label className="custom-radio-label">
                        <div>
                          <Radio
                            {...controlProps(address)}
                            name="selectedAddress"
                            checked={selectedAddressId === address._id}
                            onChange={() => handleAddressSelect(address)}
                            sx={{
                              color: "var(--secondary-color)",
                              "&.Mui-checked": {
                                color: "var(--secondary-color)",
                              },
                            }}
                          />
                        </div>
                        <div className="address-info">
                          <p>
                            <strong>{address.firstName || ""}</strong>
                            <strong style={{ marginLeft: ".2rem" }}>
                              {address.lastName || ""}
                            </strong>
                          </p>
                          <p></p>
                          <p>
                            <strong>{address.email || ""}</strong>
                          </p>
                          <p>
                            <strong>{address.phone || ""}</strong>
                          </p>
                          <p>{address.streetAddress}</p>
                          <p>
                            {address.city}, {address.state} - {address.zip}
                          </p>
                          <p>{address.country}</p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <hr style={{ margin: ".5rem 0" }} />
            <form
              onSubmit={formik.handleSubmit}
              className="checkout-single-address-form"
            >
              <label htmlFor="firstName">
                First Name:
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.firstName}
                  autoComplete="off"
                />
                {formik.touched.firstName && formik.errors.firstName ? (
                  <div className="checkout-single-error-message">
                    {formik.errors.firstName}
                  </div>
                ) : null}
              </label>
              <label htmlFor="lastName">
                Last Name:
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lastName}
                  autoComplete="off"
                />
                {formik.touched.lastName && formik.errors.lastName ? (
                  <div className="checkout-single-error-message">
                    {formik.errors.lastName}
                  </div>
                ) : null}
              </label>

              <label htmlFor="email">
                E-mail Address:
                <input
                  id="email"
                  name="email"
                  type="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  autoComplete="off"
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="checkout-single-error-message">
                    {formik.errors.email}
                  </div>
                ) : null}
              </label>
              <label htmlFor="phoneNumber">
                Phone Number
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phoneNumber}
                  autoComplete="off"
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                  <div className="checkout-single-error-message">
                    {formik.errors.phoneNumber}
                  </div>
                ) : null}
              </label>
              <label htmlFor="address">
                Address
                <input
                  id="address"
                  name="address"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.address}
                  autoComplete="off"
                />
                {formik.touched.address && formik.errors.address ? (
                  <div className="checkout-single-error-message">
                    {formik.errors.address}
                  </div>
                ) : null}
              </label>
              <label htmlFor="country">
                Country:
                <select
                  name="country"
                  id="country"
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    formik.setFieldValue(
                      "country",
                      countries.find(
                        (country) => country.code === e.target.value
                      ).name
                    );
                  }}
                  onBlur={formik.handleBlur}
                >
                  <option value="" disabled>
                    Select Country
                  </option>
                  {countries &&
                    countries.length > 0 &&
                    countries.map((country, index) => (
                      <option key={index} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                </select>
                {formik.touched.country && formik.errors.country ? (
                  <div className="checkout-single-error-message">
                    {formik.errors.country}
                  </div>
                ) : null}
              </label>

              <label htmlFor="state">
                State:
                <select
                  name="state"
                  id="state"
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    formik.setFieldValue(
                      "state",
                      states.find((state) => state.isoCode === e.target.value)
                        .name
                    );
                  }}
                  onBlur={formik.handleBlur}
                >
                  <option value="" disabled>
                    Select State
                  </option>
                  {states &&
                    states.length > 0 &&
                    states.map((state, index) => (
                      <option key={index} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                </select>
                {formik.touched.state && formik.errors.state ? (
                  <div className="checkout-single-error-message">
                    {formik.errors.state}
                  </div>
                ) : null}
              </label>

              <label htmlFor="city">
                City:
                <select
                  name="city"
                  id="city"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select City</option>
                  {cities &&
                    cities.length > 0 &&
                    cities.map((city, index) => (
                      <option key={index} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                </select>
                {formik.touched.city && formik.errors.city ? (
                  <div className="checkout-single-error-message">
                    {formik.errors.city}
                  </div>
                ) : null}
              </label>

              <label htmlFor="zipCode">
                Zip Code:
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.zipCode}
                  autoComplete="off"
                />
                {formik.touched.zipCode && formik.errors.zipCode ? (
                  <div className="checkout-single-error-message">
                    {formik.errors.zipCode}
                  </div>
                ) : null}
              </label>
              <label htmlFor="note">
                Additional note:
                <textarea
                  id="note"
                  name="note"
                  // type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.note}
                  autoComplete="off"
                />
                {formik.touched.note && formik.errors.note ? (
                  <div className="checkout-single-error-message">
                    {formik.errors.note}
                  </div>
                ) : null}
              </label>

              <div className="checkout-button-wrapper">
                <button
                  type="cancel"
                  onClick={() => navigate(-1)}
                  className="cancel-order-btn"
                >
                  <MdKeyboardArrowLeft /> Place Order
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting || productAvailableError}
                  className={`place-order-btn ${
                    productAvailableError && "inactive-btn"
                  } `}
                >
                  Place Order <MdOutlineKeyboardArrowRight />
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
