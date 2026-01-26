import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import * as Yup from "yup";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import { getActiveCountries } from "../../services/configApiService";
import { getBestSellingProducts } from "../../services/adminApiServices";
import "../AdminBestSeller/AdminBestSeller.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBestSellerById,
  updateBestSeller,
} from "../../services/bestSellerApiService";
import { IoCloudUploadOutline } from "react-icons/io5";

const CustomOption = (props) => {
  const { data, innerRef, innerProps } = props;
  return (
    <div ref={innerRef} {...innerProps} className="custom-option">
      <img
        src={`${import.meta.env.VITE_BASE_URL}/${data?.image?.path || data?.image
          }`}
        alt={data.label}
      />
      <div className="product-info">
        <div className="product-name">{data.label}</div>
        <div className="product-sold">Sold: {data.totalSold}</div>
      </div>
    </div>
  );
};

function getVideoResolution(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = function () {
      resolve({ width: video.videoWidth, height: video.videoHeight });
    };

    video.onerror = function () {
      resolve(null);
    };

    video.src = URL.createObjectURL(file);
  });
}

export default function AdminEditBestSeller() {
  const { id } = useParams();
  const [videoUrl, setVideoUrl] = useState("");
  const [countries, setCountries] = useState([]);
  const [products, setProducts] = useState([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const [countryRes, productRes, bestSeller] = await Promise.all([
        getActiveCountries(),
        getBestSellingProducts(),
        getBestSellerById(id),
      ]);

      const countryOptions = countryRes.map((c) => ({
        label: c.name,
        value: c._id,
      }));
      setCountries(countryOptions);

      const productOptions = productRes.map((p) => ({
        label: p.productName,
        value: p._id,
        image: p.productImages?.[0] || '', // Ensure image is always a string
        totalSold: p.totalSold || 0, // Ensure totalSold is always a number
      }));
      setProducts(productOptions);

      if (bestSeller) {
        formik.setValues({
          country: countryOptions.filter((c) =>
            bestSeller.country.includes(c.value)
          ),
          products: productOptions.find((p) => p.value === bestSeller.product),
          video: null,
        });
        setVideoUrl(
          bestSeller.video.startsWith("http")
            ? bestSeller.video
            : `${import.meta.env.VITE_BASE_URL}/${bestSeller.video}`
        );
        setInitialDataLoaded(true);
      }
    })();
  }, [id]);

  const validationSchema = Yup.object().shape({
    country: Yup.array()
      .min(1, "Please select at least one country")
      .required("Country is required"),
    products: Yup.object()
      .required("Product is required"),
    video: Yup.mixed()
      .nullable()
      .test(
        "fileType",
        "Only video files are allowed",
        (value) => !value || value.type.startsWith("video/")
      )
      .test(
        "isMobileResolution",
        "Video must be in vertical (mobile) format",
        async (value) => {
          if (!value) return true;
          const videoRes = await getVideoResolution(value);
          return videoRes?.height > videoRes?.width;
        }
      ),
  });

  const formik = useFormik({
    initialValues: {
      country: [],
      products: null,
      video: null,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const formData = new FormData();
      if (values.video) {
        formData.append("video", values.video);
      }
      formData.append("country", JSON.stringify(values.country));
      formData.append("product", values.products.value);
      const response = await updateBestSeller(id, formData);
      if (response) {
        navigate(-1);
      }
      setSubmitting(false);
    },
    enableReinitialize: true,
  });

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("video", file);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  if (!initialDataLoaded) return <div className="loading-container">Loading Best Seller Data...</div>;

  return (
    <div className="best-seller-main-container">
      <AdminHeader title="Edit Best Seller" />

      <div className="admin-best-seller-form-container">
        <form className="admin-best-seller-form" onSubmit={formik.handleSubmit}>

          {/* Country Selection */}
          <div className="admin-add-category-form-row">
            <label>Update Target Countries</label>
            <Select
              name="country"
              options={countries}
              isMulti
              value={formik.values.country}
              onChange={(option) => formik.setFieldValue("country", option)}
              onBlur={() => formik.setFieldTouched("country", true)}
              placeholder="Select countries"
              classNamePrefix="react-select"
            />
            {formik.touched.country && formik.errors.country && (
              <div className="error">{formik.errors.country}</div>
            )}
          </div>

          {/* Product Selection */}
          <div className="admin-add-category-form-row">
            <label>Update Best Selling Product</label>
            <Select
              name="products"
              options={products}
              components={{ Option: CustomOption }}
              value={formik.values.products}
              onChange={(selectedOption) =>
                formik.setFieldValue("products", selectedOption)
              }
              onBlur={() => formik.setFieldTouched("products", true)}
              placeholder="Select a product"
              classNamePrefix="react-select"
            />
            {formik.touched.products && formik.errors.products && (
              <div className="error">
                {typeof formik.errors.products === 'string'
                  ? formik.errors.products
                  : formik.values.products === null
                    ? 'Please select a product'
                    : Object.values(formik.errors.products)[0]}
              </div>
            )}
          </div>

          {/* Video Upload Area */}
          <div className="admin-add-category-form-row">
            <label>Update Promotion Video (Vertical 9:16)</label>
            <div className="admin-best-seller-video-upload-wrapper">
              <IoCloudUploadOutline className="upload-icon" />
              <span className="upload-text">Click to change vertical video file</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.errors.video && (
              <div className="error">{formik.errors.video}</div>
            )}
          </div>

          {/* Video Preview */}
          {videoUrl && (
            <div className="video-preview-wrapper">
              <div className="video-card">
                <video src={videoUrl} autoPlay muted loop controls />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="submit-btn"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Updating..." : "Update Best Seller Details"}
          </button>
        </form>
      </div>
    </div>
  );
}
