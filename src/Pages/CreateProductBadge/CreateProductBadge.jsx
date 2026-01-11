import { useState, useCallback, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../utils/getCroppedImage";
import "./CreateProductBadge.css";
import {
  crateBadge,
  getBadgeDetails,
  updateBadge,
} from "../../services/badgeApiServices";
import { useNavigate, useParams } from "react-router-dom";

export default function CreateProductBadge() {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const navigate = useNavigate();
  const { badgeId } = useParams();
  const [initialData, setInitialData] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const validationSchema = Yup.object({
    label: Yup.string().required("Badge label is required"),
  });

  const formik = useFormik({
    initialValues: {
      label: "",
      icon: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        if (initialData) {
          await updateBadge(initialData._id, values, setSubmitting);
        } else {
          await crateBadge(values, setSubmitting);
        }
        navigate("/admin/badges");
        resetForm();
        setCroppedImage(null);
      } catch (e) {
        console.error("Error submitting badge:", e);
      }
    },
  });

  useEffect(() => {
    if (badgeId) {
      (async () => {
        const response = await getBadgeDetails(badgeId);
        if (response) {
          formik.setValues({
            label: response.label,
            icon: response.iconUrl || null,
          });
          setInitialData(response);
        }
      })();
    }
  }, [badgeId]);

  const showCroppedImage = useCallback(async () => {
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(cropped.url);
      formik.setFieldValue("icon", cropped.file);
    } catch (e) {
      console.error("Crop error:", e);
    }
  }, [imageSrc, croppedAreaPixels, formik]);

  const handleFileChange = (e) => {
    const file = e.currentTarget.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
      formik.setFieldValue("icon", file);
    } else {
      alert("Please select a valid image file (PNG, JPG, SVG)");
    }
  };

  return (
    <div className="badge-form-container">
      <h2>{initialData ? "Edit" : "Create"} Product Feature Badge</h2>
      <form onSubmit={formik.handleSubmit} className="badge-form">
        <label>Badge Label</label>
        <input
          type="text"
          name="label"
          placeholder="e.g. Long Lasting"
          value={formik.values.label}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.label && formik.errors.label && (
          <div className="error">{formik.errors.label}</div>
        )}

        <label>Upload Icon (PNG, SVG, JPG)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {formik.touched.icon && formik.errors.icon && (
          <div className="error">{formik.errors.icon}</div>
        )}

        {imageSrc && !croppedImage && (
          <>
            <div className="crop-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <button
              type="button"
              className="crop-btn"
              onClick={showCroppedImage}
            >
              Crop Image
            </button>
          </>
        )}

        {(croppedImage || (initialData && initialData.iconUrl)) && (
          <div className="preview-wrapper">
            <p>Cropped Preview</p>
            <img
              src={
                croppedImage ||
                `${import.meta.env.VITE_BASE_URL}${initialData.iconUrl}`
              }
              alt="Cropped Icon"
              className="icon-preview"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="submit-btn"
        >
          {initialData ? "Update Badge" : "Create Badge"}
        </button>
      </form>
    </div>
  );
}
