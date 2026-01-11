import "./CategoryOffers.css";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import Select from "react-select";
import { getActiveCategories } from "../../services/categoryApiServices";
import {
  createCategoryOffer,
  updateCategoryOffer,
} from "../../services/offerApiService";
import dayjs from "dayjs";

export default function CategoryOffers(Props) {
  const { setShowForm, showForm, setChanged, editData, cancelEdit } = Props;
  const [categories, setCategories] = useState([]);
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    getActiveCategories(setCategories);
  }, []);

  const categoryOptions =
    categories.length > 0
      ? [{ label: "All Category", value: "all" }].concat(
          categories.map((category) => ({
            label: category.categoryName,
            value: category._id,
          }))
        )
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
      selectedCategories: [],
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
      selectedCategories: Yup.array()
        .min(1, "At least one category need to select")
        .required("Please select category"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      values.offerType = "category";
      let response = {};
      if (editData && Object.keys(editData).length > 0) {
        response = await updateCategoryOffer(
          editData._id,
          values,
          adminToken,
          setSubmitting
        );
      } else {
        response = await createCategoryOffer(values, adminToken, setSubmitting);
      }
      if (response) {
        resetForm();
        setChanged((prev) => !prev);
        setShowForm(false);
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
      formik.setFieldValue(
        "validFrom",
        dayjs(editData.validFrom).format("YYYY-MM-DDTHH:mm")
      );
      formik.setFieldValue(
        "validTo",
        dayjs(editData.validTo).format("YYYY-MM-DDTHH:mm")
      );
      formik.setFieldValue("description", editData.description);
      formik.setFieldValue("selectedCategories", editData.categoryIds);
      setShowForm(true);
    }
  }, [editData]);

  function handleCategoryChange(selectedOptions) {
    if (selectedOptions.some((option) => option.value === "all")) {
      const allCategoryIds = categoryOptions
        .filter((p) => p.value !== "all")
        .map((p) => p.value);

      formik.setFieldValue("selectedCategories", allCategoryIds);
    } else {
      const selectedIds = selectedOptions.map((option) => option.value);
      formik.setFieldValue("selectedCategories", selectedIds);
    }
  }

  return (
    <div className="category-offer-form-container">
      <div className="category-offer-form-header">
        <h2 className="category-offer-form-title">Offer On Category</h2>
        <button
          type="button
        "
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Cancel" : "Create Offer"}
        </button>
      </div>
      {showForm && (
        <form className="category-offer-form" onSubmit={formik.handleSubmit}>
          <div className="category-offer-row">
            <div className="category-offer-input-wrapper">
              <input
                type="text"
                name="title"
                placeholder="Offer Name *"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.title && formik.errors.title && (
                <div className="category-offer-error">
                  {formik.errors.title}
                </div>
              )}
            </div>
            <div className="category-offer-input-wrapper">
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
                <div className="category-offer-error">
                  {formik.errors.badge}
                </div>
              )}
            </div>
          </div>

          <div className="category-offer-row">
            <div className="category-offer-input-wrapper">
              <input
                type="number"
                name="minOrderValue"
                placeholder="Min Purchase *"
                value={formik.values.minOrderValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.minOrderValue && formik.errors.minOrderValue && (
                <div className="category-offer-error">
                  {formik.errors.minOrderValue}
                </div>
              )}
            </div>
            <div className="category-offer-input-wrapper">
              <input
                type="number"
                name="maxPurchase"
                placeholder="Max Purchase *"
                value={formik.values.maxPurchase}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.maxPurchase && formik.errors.maxPurchase && (
                <div className="category-offer-error">
                  {formik.errors.maxPurchase}
                </div>
              )}
            </div>
          </div>

          <div className="category-offer-row">
            <div className="category-offer-input-wrapper">
              <input
                type="number"
                name="discountValue"
                placeholder="Offer *"
                value={formik.values.discountValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.discountValue && formik.errors.discountValue && (
                <div className="category-offer-error">
                  {formik.errors.discountValue}
                </div>
              )}
            </div>
            <div className="category-offer-input-wrapper">
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
                <div className="category-offer-error">
                  {formik.errors.discountType}
                </div>
              )}
            </div>
          </div>

          <div className="category-offer-row">
            <div className="category-offer-input-wrapper">
              <Select
                options={categoryOptions}
                value={categoryOptions.filter((opt) =>
                  formik.values.selectedCategories.includes(opt.value)
                )}
                onChange={handleCategoryChange}
                isMulti
                placeholder="Choose Categories.."
              />
              {formik.touched.selectedCategories &&
                formik.errors.selectedCategories && (
                  <div className="category-offer-error">
                    {formik.errors.selectedCategories}
                  </div>
                )}
            </div>
          </div>
          <div className="category-offer-row">
            <div className="category-offer-date-time">
              <label>From Date</label>
              <div className="category-offer-input-wrapper">
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={formik.values.validFrom}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.validFrom && formik.errors.validFrom && (
                  <div className="category-offer-error">
                    {formik.errors.validFrom}
                  </div>
                )}
              </div>
            </div>
            <div className="category-offer-date-time ">
              <label>To Date</label>
              <div className="category-offer-input-wrapper">
                <input
                  type="datetime-local"
                  name="validTo"
                  value={formik.values.validTo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.validTo && formik.errors.validTo && (
                  <div className="category-offer-error">
                    {formik.errors.validTo}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="category-offer-row">
            <textarea
              name="description"
              placeholder="Offer Details"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <div className="category-offer-btn-wrapper">
            <button
              type="reset"
              className="category-offer-cancel-btn"
              onClick={() => {
                formik.resetForm();
                setShowForm(false);
                cancelEdit();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="category-offer-submit-btn"
            >
              {formik.isSubmitting
                ? "Submitting..."
                : editData && Object.keys(editData).length > 0
                ? "Update Category Offer"
                : "Submit Category Offer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
