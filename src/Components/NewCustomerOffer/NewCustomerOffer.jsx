import "./NewCustomerOffer.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  createNewCustomerOffer,
  updateNewCustomerOffer,
} from "../../services/offerApiService";
import { useEffect } from "react";
import dayjs from "dayjs";

export default function NewCustomerOffer(Props) {
  const {
    setShowForm,
    showForm,
    editData,
    setEditData,
    setChanged,
    cancelEdit,
  } = Props;
  const adminToken = localStorage.getItem("remilletAdminTkn");

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
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      values.offerType = "new-customer";
      let response;
      if (editData && Object.keys(editData).length > 0) {
        response = updateNewCustomerOffer(
          editData._id,
          values,
          adminToken,
          setSubmitting
        );
      } else {
        response = createNewCustomerOffer(values, adminToken, setSubmitting);
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
      formik.setFieldValue("description", editData.description);
      formik.setFieldValue(
        "validFrom",
        dayjs(editData.validFrom).format("YYYY-MM-DDTHH:mm")
      );
      formik.setFieldValue(
        "validTo",
        dayjs(editData.validTo).format("YYYY-MM-DDTHH:mm")
      );
    }
  }, [editData]);

  return (
    <div className="new-customer-offer-form-container">
      <div className="new-customer-offer-form-header">
        <h2 className="new-customer-offer-form-title">Offer On New Customer</h2>
        <button type="button" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Cancel" : "Create Offer"}
        </button>
      </div>
      {showForm && (
        <form
          className="new-customer-offer-form"
          onSubmit={formik.handleSubmit}
        >
          <div className="new-customer-offer-row">
            <div className="new-customer-offer-input-wrapper">
              <input
                type="text"
                name="title"
                placeholder="Offer Name *"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.title && formik.errors.title && (
                <div className="new-customer-offer-error">
                  {formik.errors.title}
                </div>
              )}
            </div>
            <div className="new-customer-offer-input-wrapper">
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
                <div className="new-customer-offer-error">
                  {formik.errors.badge}
                </div>
              )}
            </div>
          </div>

          <div className="new-customer-offer-row">
            <div className="new-customer-offer-input-wrapper">
              <input
                type="number"
                name="minOrderValue"
                placeholder="Min Purchase *"
                value={formik.values.minOrderValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.minOrderValue && formik.errors.minOrderValue && (
                <div className="new-customer-offer-error">
                  {formik.errors.minOrderValue}
                </div>
              )}
            </div>
            <div className="new-customer-offer-input-wrapper">
              <input
                type="number"
                name="maxPurchase"
                placeholder="Max Purchase *"
                value={formik.values.maxPurchase}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.maxPurchase && formik.errors.maxPurchase && (
                <div className="new-customer-offer-error">
                  {formik.errors.maxPurchase}
                </div>
              )}
            </div>
          </div>

          <div className="new-customer-offer-row">
            <div className="new-customer-offer-input-wrapper">
              <input
                type="number"
                name="discountValue"
                placeholder="Offer *"
                value={formik.values.discountValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.discountValue && formik.errors.discountValue && (
                <div className="new-customer-offer-error">
                  {formik.errors.discountValue}
                </div>
              )}
            </div>
            <div className="new-customer-offer-input-wrapper">
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
                <div className="new-customer-offer-error">
                  {formik.errors.discountType}
                </div>
              )}
            </div>
          </div>
          <div className="new-customer-offer-row">
            <div className="new-customer-offer-date-time">
              <label>From Date</label>
              <div className="new-customer-offer-input-wrapper">
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={formik.values.validFrom}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.validFrom && formik.errors.validFrom && (
                  <div className="new-customer-offer-error">
                    {formik.errors.validFrom}
                  </div>
                )}
              </div>
            </div>
            <div className="new-customer-offer-date-time ">
              <label>To Date</label>
              <div className="new-customer-offer-input-wrapper">
                <input
                  type="datetime-local"
                  name="validTo"
                  value={formik.values.validTo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.validTo && formik.errors.validTo && (
                  <div className="new-customer-offer-error">
                    {formik.errors.validTo}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="new-customer-offer-row">
            <textarea
              name="description"
              placeholder="Offer Details"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <div className="new-customer-offer-btn-wrapper">
            <button
              type="reset"
              className="new-customer-offer-cancel-btn"
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
              className="new-customer-offer-submit-btn"
            >
              {formik.isSubmitting
                ? "Submitting..."
                : editData
                ? "Update Offer"
                : "Create Offer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
