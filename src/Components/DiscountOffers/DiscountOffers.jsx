import { useFormik } from "formik";
import * as Yup from "yup";
import "./DiscountOffers.css";
import { useEffect, useState } from "react";
import { getActiveCountries } from "../../services/configApiService";
import Select from "react-select";
import { getCountryBasedProducts } from "../../services/productApiServices";
import {
  createDiscountOffer,
  editDiscountOffer,
} from "../../services/offerApiService";

export default function DiscountOffers(Props) {
  const { setChanged, setShowForm, showForm, editData, cancelEdit } = Props;
  const [activeCountries, setActiveCountry] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    (async () => {
      const response = await getActiveCountries();

      if (response) {
        setActiveCountry(response);
      }
    })();
  }, []);

  const countryOptions = activeCountries
    ? activeCountries.map((country) => ({
        value: country._id,
        label: country.name,
      }))
    : [];

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
      selectedCountries: [],
      selectedProducts: [],
    },
    validationSchema: Yup.object({
      title: Yup.string().trim().required("Offer name is required"),
      badge: Yup.string()
        .trim()
        .max(12, "Badge can be maximum 12 characters")
        .required("Badge is required"),
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
      selectedProducts: Yup.array()
        .min(1, "Please select at least one product")
        .of(Yup.string().required("Product ID is required")),
    }),
    onSubmit: async (values, { resetForm }) => {
      values.offerType = "discount";
      if (editData && Object.keys(editData).length > 0) {
        const response = editDiscountOffer(editData._id, values, adminToken);
        if (response) {
          resetForm();
          setShowForm(false);
          setChanged((prev) => !prev);
        }
      } else {
        const response = createDiscountOffer(values, adminToken);
        console.log(response, "sdaofn");
        if (response) {
          resetForm();
          setShowForm(false);
          setChanged((prev) => !prev);
        }
      }
    },
  });

  useEffect(() => {
    if (editData && Object.keys(editData).length > 0) {
      const formatDateForInput = (dateStr) => {
        const date = new Date(dateStr);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000); // adjust for timezone
        return localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
      };
      formik.setFieldValue("title", editData.title || "");
      formik.setFieldValue("badge", editData.badge || "");
      formik.setFieldValue("minOrderValue", editData.minOrderValue || "");
      formik.setFieldValue("maxPurchase", editData.maxOrderValue || "");
      formik.setFieldValue("discountValue", editData.discountValue || "");
      formik.setFieldValue("discountType", editData.discountType || "");
      formik.setFieldValue(
        "validFrom",
        editData.validFrom ? formatDateForInput(editData.validFrom) : ""
      );
      formik.setFieldValue(
        "validTo",
        editData.validTo ? formatDateForInput(editData.validTo) : ""
      );
      formik.setFieldValue("description", editData.description || "");
      formik.setFieldValue("selectedProducts", editData.productIds || "");
      formik.setFieldValue(
        "selectedCountries",
        editData.country?.map((c) => ({
          value: c._id,
          label: c.name,
        })) || []
      );
    }
  }, [editData, formik.setFieldError]);

  console.log(formik.values, "values");
  console.log(editData, "editData.countries");

  useEffect(() => {
    setProductOptions([
      { label: "No products available", value: "none", isDisabled: true },
    ]);
    getCountryBasedProducts(formik.values.selectedCountries, setProducts);
  }, [formik.values.selectedCountries]);

  const handleChange = (selectedOptions) => {
    formik.setFieldValue("selectedCountries", selectedOptions);
  };

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
    <div className="discount-offer-form-container">
      <div className="discount-offer-top-section">
        <h2 className="discount-offer-form-title">Offer On Discount</h2>
        <button type="button" onClick={() => setShowForm((prev) => !prev)}>
          Create offer
        </button>
      </div>
      {showForm && (
        <form className="discount-offer-form" onSubmit={formik.handleSubmit}>
          <div className="discount-offer-row">
            <div className="discount-offer-input-wrapper">
              <input
                type="text"
                name="title"
                placeholder="Offer Name *"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.title && formik.errors.title && (
                <div className="discount-offer-error">
                  {formik.errors.title}
                </div>
              )}
            </div>
            <div className="discount-offer-input-wrapper">
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
                <div className="discount-offer-error">
                  {formik.errors.badge}
                </div>
              )}
            </div>
          </div>

          <div className="discount-offer-row">
            <div className="discount-offer-input-wrapper">
              <input
                type="number"
                name="minOrderValue"
                placeholder="Min Purchase *"
                value={formik.values.minOrderValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.minOrderValue && formik.errors.minOrderValue && (
                <div className="discount-offer-error">
                  {formik.errors.minOrderValue}
                </div>
              )}
            </div>
            <div className="discount-offer-input-wrapper">
              <input
                type="number"
                name="maxPurchase"
                placeholder="Max Purchase *"
                value={formik.values.maxPurchase}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.maxPurchase && formik.errors.maxPurchase && (
                <div className="discount-offer-error">
                  {formik.errors.maxPurchase}
                </div>
              )}
            </div>
          </div>

          <div className="discount-offer-row">
            <div className="discount-offer-input-wrapper">
              <input
                type="number"
                name="discountValue"
                placeholder="Offer *"
                value={formik.values.discountValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.discountValue && formik.errors.discountValue && (
                <div className="discount-offer-error">
                  {formik.errors.discountValue}
                </div>
              )}
            </div>
            <div className="discount-offer-input-wrapper">
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
                <div className="discount-offer-error">
                  {formik.errors.discountType}
                </div>
              )}
            </div>
          </div>

          <div className="discount-offer-row">
            <div className="discount-offer-input-wrapper">
              <Select
                options={countryOptions}
                value={formik.values.selectedCountries}
                onChange={handleChange}
                isMulti
                placeholder="Choose countries..."
              />
              {formik.touched.selectedCountries &&
                formik.errors.selectedCountries && (
                  <div className="discount-offer-error">
                    {formik.errors.selectedCountries}
                  </div>
                )}
            </div>
            <div className="discount-offer-input-wrapper">
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
          <div className="discount-offer-row">
            <div className="discount-offer-date-time">
              <label>From Date</label>
              <div className="discount-offer-input-wrapper">
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={formik.values.validFrom}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.validFrom && formik.errors.validFrom && (
                  <div className="discount-offer-error">
                    {formik.errors.validFrom}
                  </div>
                )}
              </div>
            </div>
            <div className="discount-offer-date-time ">
              <label>To Date</label>
              <div className="discount-offer-input-wrapper">
                <input
                  type="datetime-local"
                  name="validTo"
                  value={formik.values.validTo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.validTo && formik.errors.validTo && (
                  <div className="discount-offer-error">
                    {formik.errors.validTo}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="discount-offer-row">
            <textarea
              name="description"
              placeholder="Offer Details"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <div className="discount-offer-btn-wrapper">
            <button
              type="reset"
              onClick={() => {
                formik.resetForm();
                setShowForm(false);
                cancelEdit();
              }}
              className="discount-offer-cancel-btn"
            >
              Cancel
            </button>
            <button type="submit" className="discount-offer-submit-btn">
              {editData && Object.keys(editData).length > 0
                ? "Save"
                : "Submit Discount Offer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
