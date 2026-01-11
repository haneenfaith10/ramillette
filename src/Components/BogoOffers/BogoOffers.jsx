import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { useEffect, useState } from "react";
import "./BogoOffers.css";
import dayjs from "dayjs";
import {
  createBoGoOffer,
  updateBogoOffer,
} from "../../services/offerApiService";
import { getAllProductsForAdmin } from "../../services/productApiServices";

export default function BogoOffers({
  setShowForm,
  showForm,
  editData,
  setChanged,
  cancelEdit,
}) {
  const [products, setProducts] = useState([]);
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    getAllProductsForAdmin(setProducts, adminToken);
  }, [adminToken]);

  const productOptions = products.map((p) => ({
    label: p.productName,
    value: p._id,
  }));

  const formik = useFormik({
    initialValues: {
      title: "",
      badge: "",
      description: "",
      buyProductId: "",
      buyQuantity: 1,
      discount: "",
      validFrom: "",
      validTo: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      badge: Yup.string().required("Badge is required"),
      buyProductId: Yup.string().required("Select a product"),
      buyQuantity: Yup.number().min(1).required("Required"),
      discount: Yup.number()
        .min(1, "Min 1%")
        .max(100, "Max 100%")
        .required("Discount is required"),
      validFrom: Yup.string().required("Start date required"),
      validTo: Yup.string().required("End date required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      values.offerType = "bogo"; // backend classification type
      values.getProductId = values.buyProductId; // same product
      values.getQuantity = 0; // no free item

      let response;
      if (editData && Object.keys(editData).length > 0) {
        response = await updateBogoOffer(editData._id, values, adminToken);
      } else {
        response = await createBoGoOffer(values, adminToken);
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
      formik.setFieldValue("description", editData.description);
      formik.setFieldValue("buyQuantity", editData.buyQuantity);
      formik.setFieldValue("discount", editData.discount);
      formik.setFieldValue("buyProductId", editData.buyProductId._id);
      formik.setFieldValue("discount", editData.discountValue || 0);
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
    <div className="bogo-offer-form-container">
      <div className="bogo-offer-form-header">
        <h2>Buy X Get Discount Offer</h2>
        <button type="button" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Cancel" : "Create Offer"}
        </button>
      </div>

      {showForm && (
        <form className="bogo-offer-form" onSubmit={formik.handleSubmit}>
          <div className="bogo-row">
            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="title"
                placeholder="Offer Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.title && formik.errors.title && (
                <div className="bogo-offer-error">{formik.errors.title}</div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="badge"
                placeholder="Badge (Max 12 chars)"
                value={formik.values.badge}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                maxLength={12}
              />
              {formik.touched.badge && formik.errors.badge && (
                <div className="bogo-offer-error">{formik.errors.badge}</div>
              )}
            </div>
          </div>

          <div className="bogo-row">
            <div style={{ width: "100%" }}>
              <label>Product</label>
              <Select
                options={productOptions}
                name="buyProductId"
                value={
                  productOptions.find(
                    (opt) => opt.value === formik.values.buyProductId
                  ) || null
                }
                onChange={(option) =>
                  formik.setFieldValue("buyProductId", option.value)
                }
                onBlur={() => formik.setFieldTouched("buyProductId", true)}
              />
              {formik.touched.buyProductId && formik.errors.buyProductId && (
                <div className="bogo-offer-error">
                  {formik.errors.buyProductId}
                </div>
              )}
            </div>
          </div>

          <div className="bogo-row">
            <div style={{ flex: 1 }}>
              <label>Buy Quantity</label>
              <input
                type="number"
                name="buyQuantity"
                placeholder="Buy Quantity"
                value={formik.values.buyQuantity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.buyQuantity && formik.errors.buyQuantity && (
                <div className="bogo-offer-error">
                  {formik.errors.buyQuantity}
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label>Discount (%)</label>
              <input
                type="number"
                name="discount"
                placeholder="Discount %"
                value={formik.values.discount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.discount && formik.errors.discount && (
                <div className="bogo-offer-error">{formik.errors.discount}</div>
              )}
            </div>
          </div>

          <div className="bogo-row">
            <div style={{ flex: 1 }}>
              <label>From</label>
              <input
                type="datetime-local"
                name="validFrom"
                value={formik.values.validFrom}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.validFrom && formik.errors.validFrom && (
                <div className="bogo-offer-error">
                  {formik.errors.validFrom}
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label>To</label>
              <input
                type="datetime-local"
                name="validTo"
                value={formik.values.validTo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.validTo && formik.errors.validTo && (
                <div className="bogo-offer-error">{formik.errors.validTo}</div>
              )}
            </div>
          </div>

          <div className="bogo-row">
            <textarea
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="bogo-offer-btn-wrapper">
            <button
              type="reset"
              className="bogo-offer-cancel-btn"
              onClick={() => {
                formik.resetForm();
                setShowForm(false);
                cancelEdit();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="bogo-offer-submit-btn">
              Submit Offer
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
