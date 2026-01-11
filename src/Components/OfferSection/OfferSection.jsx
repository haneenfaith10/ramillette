import { useFormik } from "formik";
import * as Yup from "yup";
import "./OfferSection.css";
import { createOffer, editOffer } from "../../services/offerApiService";
import { useEffect } from "react";

export default function OfferSection({
  setOffers,
  setChanged = () => {},
  isCommon = false,
  initialValues = {},
  clearEdit = () => {},
}) {
  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),

    type: Yup.string()
      .oneOf(
        [
          "limited-time",
          "buy-one-get-one",
          "exclusive",
          "flash-sale",
          "bundle",
          "coupon-based",
          "category-based",
          "min-order-value",
        ],
        "Invalid offer type"
      )
      .required("Offer type is required"),

    discountType: Yup.string()
      .nullable()
      .when("type", {
        is: (val) => val !== "buy-one-get-one",
        then: (schema) =>
          schema
            .required("Discount type is required")
            .oneOf(["percent", "flat"]),
        otherwise: (schema) => schema.nullable(),
      }),

    discountValue: Yup.number()
      .nullable()
      .when("type", {
        is: (val) => val !== "buy-one-get-one",
        then: (schema) =>
          schema
            .required("Discount value is required")
            .positive("Must be a positive number"),
        otherwise: (schema) => schema.nullable(),
      }),

    validFrom: Yup.date()
      .required("Valid from date is required")
      .typeError("Invalid date format"),

    validTo: Yup.date()
      .nullable()
      .typeError("Invalid date format")
      .min(Yup.ref("validFrom"), "Valid to must be after valid from"),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      type: "",
      discountType: "",
      discountValue: "",
      validFrom: "",
      validTo: "",
    },

    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      values.isCommonOffer = isCommon;
      if (Object.keys(initialValues).length > 0) {
        const response = await editOffer(initialValues._id, values);
        if (response) {
          setChanged((prev) => !prev);
          resetForm();
        }
      } else {
        const res = await createOffer(values, setSubmitting, true);
        if (res && res.isSuccess) {
          setOffers((prev) => [...prev, res.offer]);
          setChanged((prev) => !prev);
          const saved = JSON.parse(localStorage.getItem("unsavedOffers")) || [];
          saved.push(res.offer._id);
          localStorage.setItem("unsavedOffers", JSON.stringify(saved));
          resetForm();
        }
      }
    },
  });

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      formik.setFieldValue("title", initialValues.title);
      formik.setFieldValue("type", initialValues.type);
      formik.setFieldValue("discountType", initialValues.discountType);
      formik.setFieldValue("discountValue", initialValues.discountValue);
      formik.setFieldValue("validFrom", initialValues.validFrom);
      formik.setFieldValue("validTo", initialValues.validTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const offerType = [
    { label: "Limited Time", value: "limited-time" },
    { label: "Buy One Get One", value: "buy-one-get-one" },
    { label: "Exclusive", value: "exclusive" },
    { label: "Flash Sale", value: "flash-sale" },
    { label: "Bundle", value: "bundle" },
    { label: "Coupon Based", value: "coupon-based" },
    { label: "Category Based", value: "category-based" },
    { label: "Min Order Value", value: "min-order-value" },
  ];

  return (
    <div className="product-offer-section-wrapper">
      <h2>Product Offers</h2>

      <div className="offer-form">
        <div className="offer-form-grid">
          <label>
            Offer Title:
            <input
              type="text"
              name="title"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.title}
            />
            {formik.touched.title && formik.errors.title && (
              <div className="error">{formik.errors.title}</div>
            )}
          </label>

          <label>
            Offer Type:
            <select
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
            >
              <option hidden disabled value="">
                Select offer type
              </option>
              {offerType &&
                offerType.length > 0 &&
                offerType.map((type, index) => (
                  <option key={index} value={type.value}>
                    {type.label}
                  </option>
                ))}
            </select>
            {formik.touched.type && formik.errors.type && (
              <div className="error">{formik.errors.type}</div>
            )}
          </label>

          <label>
            Discount Type:
            <select
              name="discountType"
              value={formik.values.discountType}
              onChange={formik.handleChange}
              disabled={formik.values.type === "buy-one-get-one"}
            >
              <option disabled hidden value="">
                Select discount type
              </option>
              <option value="percent">Percentage (%)</option>
              <option value="flat">Flat Amount</option>
            </select>
            {formik.touched.discountType && formik.errors.discountType && (
              <div className="error">{formik.errors.discountType}</div>
            )}
          </label>

          <label>
            Discount Value:
            <input
              type="number"
              name="discountValue"
              placeholder="Enter the discount price"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.discountValue}
              disabled={formik.values.type === "buy-one-get-one"}
              className="offer-section-discount-price"
            />
            {formik.touched.discountValue && formik.errors.discountValue && (
              <div className="error">{formik.errors.discountValue}</div>
            )}
          </label>

          <label>
            Valid From:
            <input
              type="date"
              name="validFrom"
              value={formik.values.validFrom}
              onChange={formik.handleChange}
            />
            {formik.touched.validFrom && formik.errors.validFrom && (
              <div className="error">{formik.errors.validFrom}</div>
            )}
          </label>

          <label>
            Valid To:
            <input
              type="date"
              name="validTo"
              value={formik.values.validTo}
              onChange={formik.handleChange}
            />
          </label>
        </div>
        <div>
          {Object.keys(initialValues).length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearEdit();
                formik.resetForm();
              }}
              style={{
                marginRight: "1rem",
                backgroundColor: "gray",
              }}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={formik.handleSubmit}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
              ? "Adding..."
              : Object.keys(initialValues).length > 0
              ? "Edit Offer"
              : "Create Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}
