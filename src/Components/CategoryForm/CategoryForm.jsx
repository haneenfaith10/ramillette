import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useRef, useState } from "react";
import {
  addProductCategory,
  editProductCategory,
} from "../../services/categoryApiServices";
import { Navigate, useNavigate } from "react-router-dom";
import { IoCloudUploadOutline } from "react-icons/io5";

function CategoryForm({ mode, categoryData, categoryId }) {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (categoryData && Object.keys(categoryData)?.length !== 0) {
      setImagePreview(
        `${import.meta.env.VITE_BASE_URL}/${categoryData.categoryImage}`
      );
    }
  }, [categoryData]);

  const validationSchema = Yup.object().shape({
    categoryName: Yup.string()
      .required("Category name is required")
      .min(2, "Category name must be at least 2 characters"),

    categoryImage: Yup.mixed()
      .test("fileType", "Unsupported file format", (value) => {
        if (!value || typeof value === "string") return true; // allow existing URL
        const supportedFormats = ["image/jpeg", "image/png", "image/webp"];
        return supportedFormats.includes(value.type);
      })
      .required("Category image is required"),
  });
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    touched,
    isSubmitting,
  } = useFormik({
    initialValues: {
      categoryName: categoryData?.categoryName || "",
      categoryImage: categoryData?.categoryImage || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (mode == "ADD") {
        const response = await addProductCategory(
          values,
          setSubmitting,
          resetForm,
          imageRef,
          setImagePreview
        );
        if (response.isSuccess) {
          navigate(-1);
        }
      } else if (mode == "EDIT") {
        if (typeof values.categoryImage === "string") {
          delete values.categoryImage;
        }
        const editResponse = await editProductCategory(
          values,
          setSubmitting,
          resetForm,
          imageRef,
          setImagePreview,
          categoryId
        );
        if (editResponse.isSuccess) {
          navigate(-1);
        }
      }
    },
  });

  //   function to manage the image change
  function handleImageChange(event) {
    const file = event.currentTarget.files[0];
    if (file) {
      setFieldValue("categoryImage", file);
      setImagePreview(URL.createObjectURL(file));
    }
  }
  return (
    <form onSubmit={handleSubmit} className="admin-add-category-form">
      {/* Category Name */}
      <div className="admin-add-category-form-row">
        <label htmlFor="categoryName">Category Name</label>
        <input
          id="categoryName"
          name="categoryName"
          type="text"
          placeholder="e.g. Traditional Flowers"
          value={values.categoryName}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors.categoryName && touched.categoryName && (
          <p className="error-message">{errors.categoryName}</p>
        )}
      </div>

      {/* Category Image */}
      <div className="admin-add-category-form-row">
        <label>Category Image</label>
        <div className="admin-add-category-file-input-wrapper">
          <IoCloudUploadOutline className="upload-icon" />
          <span className="upload-text">Click to upload or drag & drop</span>
          <input
            type="file"
            id="categoryImage"
            name="categoryImage"
            accept="image/*"
            onChange={handleImageChange}
            ref={imageRef}
            onBlur={handleBlur}
          />
        </div>
        {errors.categoryImage && touched.categoryImage && (
          <p className="error-message">{errors.categoryImage}</p>
        )}
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="admin-add-category-image-preview-wrapper">
          <img src={imagePreview} alt="category-image-preview" />
        </div>
      )}

      {/* Submit Button */}
      <div className="admin-add-category-submit-btn-wrapper">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "ADD" ? "Create Category" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default CategoryForm;
