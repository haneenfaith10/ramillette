import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AddBrand.css";
import ImageCropper from "../../Components/ImageCropper/ImageCropper";
import { createNewBrand } from "../../services/brandApiServices";

export default function AddBrand() {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImg, setCroppedImg] = useState(null);

  const validationSchema = Yup.object({
    brandName: Yup.string()
      .required("Brand name is required")
      .min(2, "Brand name is too short"),
    brandImage: Yup.mixed()
      .required("Brand image is required")
      .test(
        "fileFormat",
        "Only jpeg, jpg, png, webp formats are allowed.",
        (value) => {
          if (!value) return false;
          const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ];
          return allowedTypes.includes(value.type);
        }
      )
      .test("fileSize", "File must be less than 5MB.", (value) => {
        if (!value) return false;
        return value.size <= 5 * 1024 * 1024;
      }),
  });

  const formik = useFormik({
    initialValues: {
      brandName: "",
      brandImage: null,
    },
    validationSchema,
    onSubmit: (values, { setSubmitting, resetForm }) => {
      const formData = new FormData();

      formData.append("brandName", values.brandName);
      formData.append("brandImage", values.brandImage);

      createNewBrand(formData, setSubmitting, resetForm, setCroppedImg);
    },
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
    setCroppedImg(null);
  };

  const handleCropComplete = (cropped) => {
    setCroppedImg(URL.createObjectURL(cropped));
    formik.setFieldValue("brandImage", cropped);
  };

  return (
    <div className="admin-add-brand-main-container">
      <AdminHeader title="Add Brand" />
      <form onSubmit={formik.handleSubmit}>
        <div className="admin-add-brand-content-section">
          <div className="admin-add-brand-image-crop-wrapper">
            <label className="admin-add-brand-image-crop">
              Select Brand Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
            {formik.errors.brandImage && formik.touched.brandImage && (
              <div className="error-message">{formik.errors.brandImage}</div>
            )}

            {imageSrc && !croppedImg && (
              <ImageCropper
                imageSrc={imageSrc}
                onCropComplete={handleCropComplete}
                setImageSrc={setImageSrc}
              />
            )}

            {croppedImg && (
              <div className="admin-add-brand-cropped-image-preview">
                <h3>Cropped Image:</h3>
                <img src={croppedImg} alt="Cropped" />
              </div>
            )}
          </div>

          <input
            type="text"
            name="brandName"
            placeholder="Enter brand name"
            className="admin-add-brand-name-input"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.brandName}
          />
          {formik.errors.brandName && formik.touched.brandName && (
            <div className="error-message">{formik.errors.brandName}</div>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="admin-add-brand-save-btn"
          >
            Save brand
          </button>
        </div>
      </form>
    </div>
  );
}
