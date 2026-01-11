import "./CouponOffer.css";
import * as Yup from "yup";
import Select from "react-select";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { getActiveCountries } from "../../services/configApiService";
import { getCountryBasedProducts } from "../../services/productApiServices";
import {
  createCouponOffer,
  updateCouponOffer,
} from "../../services/offerApiService";
import dayjs from "dayjs";

export default function CouponOffer(Props) {
  const {
    setShowForm,
    showForm,
    editData,
    setChanged,
    setEditData,
    cancelEdit,
  } = Props;
  const [activeCountries, setActiveCountry] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const adminToken = localStorage.getItem("remilletAdminTkn");
  -useEffect(() => {
    (async () => {
      const response = await getActiveCountries();

      if (response) {
        setActiveCountry(response);
      }
    })();
  }, []);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      const transformed = products.map((p) => ({
        label: p.productName,
        value: p._id,
      }));

      setProductOptions([
        { label: "All Products", value: "all" },
        ...transformed,
      ]);
    } else {
      setProductOptions([
        { label: "No products available", value: "none", isDisabled: true },
      ]);
    }
  }, [products]);

  const countryOptions =
    activeCountries.length > 0
      ? activeCountries.map((country) => ({
          label: country.name,
          value: country._id,
        }))
      : [{ label: "No Categories available", value: "none", isDisabled: true }];

  const formik = useFormik({
    initialValues: {
      title: "",
      badge: "",
      minOrderValue: "",
      maxPurchase: "",
      discountValue: "",
      discountType: "",
      offerType: "",
      validFrom: "",
      validTo: "",
      description: "",
      couponCode: "",
      couponCount: "",
      selectedCountries: [],
      selectedProducts: [],
    },
    validationSchema: Yup.object({
      title: Yup.string().trim().required("Offer name is required"),
      badge: Yup.string().trim().required("Badge is required"),
      minOrderValue: Yup.number()
        .typeError("Minimum purchase must be a number")
        .required("Minimum purchase is required")
        .positive("Must be a positive number"),
      maxPurchase: Yup.number()
        .typeError("Max Purchase must be a number")
        .required("Max Purchase is required")
        .positive("Must be a positive number"),
      discountValue: Yup.number()
        .typeError("Discount value must be a number")
        .required("Discount value is required")
        .positive("Must be a positive number"),
      discountType: Yup.string()
        .required("Discount type is required")
        .oneOf(["percent", "flat"], "Invalid discount type"),
      validFrom: Yup.string().required("Start date is required"),
      validTo: Yup.string().required("End date is required"),
      couponCode: Yup.string()
        .trim()
        .required("Coupon code is required")
        .min(3, "Coupon code must be at least 3 characters")
        .max(20, "Coupon code must be at most 20 characters"),

      couponCount: Yup.number()
        .typeError("Coupon count must be a number")
        .required("Maximum coupon count is required")
        .positive("Must be a positive number")
        .integer("Must be a whole number"),
      selectedProducts: Yup.array()
        .min(1, "Please select at least one product")
        .of(Yup.string().required("Product ID is required")),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      values.offerType = "coupon";
      let response = {};
      if (editData && Object.keys(editData).length > 0) {
        response = await updateCouponOffer(
          editData._id,
          values,
          adminToken,
          setSubmitting
        );
      } else {
        response = await createCouponOffer(values, adminToken, setSubmitting);
      }
      if (response) {
        resetForm();
        setShowForm(false);
        setChanged((prev) => !prev);
        setEditData({});
      }
    },
  });

  useEffect(() => {
    if (editData && Object.keys(editData).length > 0) {
      formik.setFieldValue("title", editData.title);
      formik.setFieldValue("badge", editData.badge);
      formik.setFieldValue("minOrderValue", editData.minOrderValue);
      formik.setFieldValue("maxPurchase", editData.maxOrderValue);
      formik.setFieldValue("discountValue", editData.discountValue);
      formik.setFieldValue("discountType", editData.discountType);
      formik.setFieldValue("discountType", editData.discountType);
      formik.setFieldValue(
        "validFrom",
        dayjs(editData.validFrom).format("YYYY-MM-DDTHH:mm")
      );
      formik.setFieldValue(
        "validTo",
        dayjs(editData.validTo).format("YYYY-MM-DDTHH:mm")
      );
      formik.setFieldValue("couponCode", editData.couponCode);
      formik.setFieldValue("couponCount", editData.usageLimit);
      formik.setFieldValue("selectedProducts", editData.productIds);
      formik.setFieldValue("description", editData.description);
      formik.setFieldValue(
        "selectedCountries",
        editData.country?.map((c) => ({
          value: c._id,
          label: c.name,
        })) || []
      );
    }
  }, [editData]);

  console.log(formik.values, "values");
  console.log(editData, "Editdata");

  function handleChangeCountry(selectedOptions) {
    formik.setFieldValue("selectedCountries", selectedOptions);
  }

  useEffect(() => {
    // Reset product options first
    setProductOptions([
      { label: "No products available", value: "none", isDisabled: true },
    ]);

    // Fetch products for selected countries
    getCountryBasedProducts(formik.values.selectedCountries, setProducts);
  }, [formik.values.selectedCountries]);

  function handleProductChange(selectedOptions) {
    if (!selectedOptions) return;

    if (selectedOptions.some((option) => option.value === "all")) {
      const allProductIds = productOptions
        .filter((p) => p.value !== "all")
        .map((p) => p.value);

      formik.setFieldValue("selectedProducts", allProductIds);
    } else {
      const selectedIds = selectedOptions.map((option) => option.value);
      formik.setFieldValue("selectedProducts", selectedIds);
    }
  }

  return (
    <div className="coupon-offer-form-container">
      <div className="coupon-offer-form-header">
        <h2 className="coupon-offer-form-title">Offer On Coupon</h2>
        <button
          type="button"
          onClick={() => {
            setShowForm((prev) => !prev);
            setEditData({});
          }}
        >
          {showForm ? "Cancel" : "Create Offer"}
        </button>
      </div>
      {showForm && (
        <form className="coupon-offer-form" onSubmit={formik.handleSubmit}>
          <div className="coupon-offer-row">
            <div className="coupon-offer-input-wrapper">
              <input
                type="text"
                name="title"
                placeholder="Offer Name *"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.title && formik.errors.title && (
                <div className="coupon-offer-error">{formik.errors.title}</div>
              )}
            </div>
            <div className="coupon-offer-input-wrapper">
              <input
                type="text"
                name="badge"
                placeholder="Badge *"
                value={formik.values.badge}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                maxLength={12}
              />
              {formik.touched.badge && formik.errors.badge && (
                <div className="coupon-offer-error">{formik.errors.badge}</div>
              )}
            </div>
          </div>

          <div className="coupon-offer-row">
            <div className="coupon-offer-input-wrapper">
              <input
                type="number"
                name="minOrderValue"
                placeholder="Min Purchase *"
                value={formik.values.minOrderValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.minOrderValue && formik.errors.minOrderValue && (
                <div className="coupon-offer-error">
                  {formik.errors.minOrderValue}
                </div>
              )}
            </div>
            <div className="coupon-offer-input-wrapper">
              <input
                type="number"
                name="maxPurchase"
                placeholder="Max Purchase *"
                value={formik.values.maxPurchase}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.maxPurchase && formik.errors.maxPurchase && (
                <div className="coupon-offer-error">
                  {formik.errors.maxPurchase}
                </div>
              )}
            </div>
          </div>

          <div className="coupon-offer-row">
            <div className="coupon-offer-input-wrapper">
              <input
                type="number"
                name="discountValue"
                placeholder="Offer *"
                value={formik.values.discountValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.discountValue && formik.errors.discountValue && (
                <div className="coupon-offer-error">
                  {formik.errors.discountValue}
                </div>
              )}
            </div>
            <div className="coupon-offer-input-wrapper">
              <select
                name="discountType"
                value={formik.values.discountType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Discount Type</option>
                <option value="percent">%</option>
                <option value="flat">Flat</option>
              </select>
              {formik.touched.discountType && formik.errors.discountType && (
                <div className="coupon-offer-error">
                  {formik.errors.discountType}
                </div>
              )}
            </div>
          </div>

          <div className="coupon-offer-row">
            <div className="coupon-offer-input-wrapper">
              <input
                type="text"
                name="couponCode"
                placeholder="Coupon Code"
                value={formik.values.couponCode.trim().toUpperCase()}
                onChange={(e) =>
                  formik.setFieldValue(
                    "couponCode",
                    e.target.value.trim().toUpperCase()
                  )
                }
                onBlur={formik.handleBlur}
              />
              {formik.touched.couponCode && formik.errors.couponCode && (
                <div className="coupon-offer-error">
                  {formik.errors.couponCode}
                </div>
              )}
            </div>
            <div className="coupon-offer-input-wrapper">
              <input
                type="number"
                name="couponCount"
                placeholder="Maximum coupon count to use"
                value={formik.values.couponCount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.couponCount && formik.errors.couponCount && (
                <div className="coupon-offer-error">
                  {formik.errors.couponCount}
                </div>
              )}
            </div>
          </div>
          <div className="coupon-offer-row">
            <div className="coupon-offer-input-wrapper">
              <Select
                options={countryOptions}
                value={formik.values.selectedCountries}
                onChange={handleChangeCountry}
                isMulti
                placeholder="Choose Country.."
              />
              {formik.touched.selectedCountries &&
                formik.errors.selectedCountries && (
                  <div className="category-offer-error">
                    {formik.errors.selectedCountries}
                  </div>
                )}
            </div>
            <div className="coupon-offer-input-wrapper">
              <Select
                options={productOptions}
                onChange={handleProductChange}
                value={productOptions.filter((opt) =>
                  formik.values.selectedProducts.includes(opt.value)
                )}
                isMulti
                placeholder="Select products..."
              />
              {formik.touched.selectedProducts &&
                formik.errors.selectedProducts && (
                  <div className="discount-offer-error">
                    {formik.errors.selectedProducts}
                  </div>
                )}
            </div>
          </div>
          <div className="coupon-offer-row">
            <div className="coupon-offer-date-time">
              <label>From Date</label>
              <div className="coupon-offer-input-wrapper">
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={formik.values.validFrom}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.validFrom && formik.errors.validFrom && (
                  <div className="coupon-offer-error">
                    {formik.errors.validFrom}
                  </div>
                )}
              </div>
            </div>
            <div className="coupon-offer-date-time ">
              <label>To Date</label>
              <div className="coupon-offer-input-wrapper">
                <input
                  type="datetime-local"
                  name="validTo"
                  value={formik.values.validTo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.validTo && formik.errors.validTo && (
                  <div className="coupon-offer-error">
                    {formik.errors.validTo}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="coupon-offer-row">
            <textarea
              name="description"
              placeholder="Offer Details"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <div className="coupon-offer-btn-wrapper">
            <button
              type="reset"
              className="coupon-offer-cancel-btn"
              onClick={() => {
                formik.resetForm();
                setShowForm(false);
                cancelEdit();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="coupon-offer-submit-btn">
              Submit Category Offer
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
