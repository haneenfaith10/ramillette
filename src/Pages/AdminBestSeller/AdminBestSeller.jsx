import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import "./AdminBestSeller.css";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import { getActiveCountries } from "../../services/configApiService";
import { getBestSellingProducts } from "../../services/adminApiServices";
import { postBestSeller } from "../../services/bestSellerApiService";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const CustomOption = (props) => {
  const { data, innerRef, innerProps } = props;

  return (
    <div ref={innerRef} {...innerProps} className="custom-option">
      <img
        src={`${import.meta.env.VITE_BASE_URL}/${data.image}`}
        alt={data.label}
      />
      <div className="product-info">
        <div className="product-name">{data.label}</div>
        <div className="product-sold">Sold: {data.totalSold}</div>
      </div>
    </div>
  );
};

export default function AdminBestSeller() {
  const [videoUrl, setVideoUrl] = useState("");
  const [countries, setCountries] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const response = await getActiveCountries();
      if (response) {
        const updatedCountry = response.map((country) => {
          return { value: country._id, label: country.name };
        });
        setCountries(updatedCountry);
      }
    })();
    getBestSellingProducts(setProducts);
  }, []);

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

  const validationSchema = Yup.object().shape({
    country: Yup.array()
      .min(1, "Please select at least one country")
      .required("Country is required"),

    products: Yup.object()
      .shape({
        value: Yup.string().required("Product ID is missing"),
        label: Yup.string().required("Product name is missing"),
        image: Yup.string().required("Product image is missing"),
        totalSold: Yup.number().required("Product sales count is missing"),
      })
      .required("Product is required"),
    video: Yup.mixed()
      .required("Video is required")
      .test(
        "fileType",
        "Only video files are allowed",
        (value) => value && value.type.startsWith("video/")
      )
      .test(
        "isMobileResolution",
        "Video must be in vertical (mobile) format",
        async (value) => {
          if (!value) return false;

          const videoRes = await getVideoResolution(value);
          return videoRes?.height > videoRes?.width; // Vertical video check
        }
      ),
  });

  const formik = useFormik({
    initialValues: {
      country: null,
      products: [],
      video: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      const formData = new FormData();
      formData.append("video", values.video);
      formData.append("country", JSON.stringify(values.country));
      formData.append("product", JSON.stringify(values.products));
      const response = await postBestSeller(formData);
      if (response) {
        resetForm();
        setSubmitting(false);
        setVideoUrl(null);
        navigate("/admin/best-seller");
      }
    },
  });

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("video", file);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="best-seller-main-container">
      <AdminHeader title="Create Best Seller" />
      <div className="admin-best-seller-form">
        {/* <h2>Best Seller Configuration</h2> */}
        <form onSubmit={formik.handleSubmit}>
          {/* Video Upload */}
          <div className="admin-best-seller-form-group">
            <label>Upload Best Seller Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              onBlur={formik.handleBlur}
            />
            {formik.touched.video && formik.errors.video && (
              <div className="error">{formik.errors.video}</div>
            )}
            {videoUrl && (
              <div className="video-preview">
                <video src={videoUrl} width="100%" height="auto" controls />
              </div>
            )}
          </div>

          {/* Country Selection */}
          <div className="admin-best-seller-form-group">
            <label>Select Country</label>
            <Select
              name="country"
              options={countries}
              value={formik.values.country}
              isMulti
              onChange={(option) => formik.setFieldValue("country", option)}
              onBlur={() => formik.setFieldTouched("country", true)}
              placeholder="Select a country"
            />
            {formik.touched.country && formik.errors.country && (
              <div className="error">{formik.errors.country}</div>
            )}
          </div>

          {/* Product Selection */}
          <div className="admin-best-seller-form-group">
            <label>Select Products</label>
            <Select
              name="products"
              options={products.map((product) => ({
                label: product.productName,
                value: product._id,
                image: product.productImages?.[0].path,
                totalSold: product.totalSold,
              }))}
              components={{ Option: CustomOption }}
              value={formik.values.products}
              onChange={(selectedOption) =>
                formik.setFieldValue("products", selectedOption)
              }
              onBlur={() => formik.setFieldTouched("products", true)}
              placeholder="Select a product"
            />
            {formik.touched.products && formik.errors.products && (
              <div className="error">{formik.errors.products}</div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="submit-btn"
            style={{
              marginTop: "2rem",
            }}
          >
            {formik.isSubmitting ? "Saving.." : "Save Best Seller"}
          </button>
        </form>
      </div>
    </div>
  );
}
