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
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import { IoCloudUploadOutline } from "react-icons/io5";

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
      // Reset cropped image when new file is selected
      setCroppedImage(null);
      formik.setFieldValue("icon", file);
    } else {
      alert("Please select a valid image file (PNG, JPG, SVG)");
    }
  };

  return (
    <div className="badge-form-container">
      <AdminHeader title={initialData ? "Edit Badge" : "Create Badge"} />

      <div className="admin-badge-form-card">
        <form onSubmit={formik.handleSubmit} className="badge-form">
          <div className="admin-form-row">
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
          </div>

          <div className="admin-form-row">
            <label>Badge Icon</label>
            <div className="admin-badge-icon-upload-wrapper">
              <IoCloudUploadOutline className="upload-icon" />
              <span className="upload-text">Select icon (PNG, SVG, JPG)</span>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            {formik.touched.icon && formik.errors.icon && (
              <div className="error">{formik.errors.icon}</div>
            )}
          </div>

          {imageSrc && !croppedImage && (
            <div className="admin-form-row">
              <label>Adjust Icon Area</label>
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
                Apply Crop
              </button>
            </div>
          )}

          {(croppedImage || (initialData && initialData.iconUrl)) && !imageSrc && (
            <div className="preview-wrapper">
              <p>Current Badge Icon</p>
              <img
                src={
                  croppedImage ||
                  `${import.meta.env.VITE_BASE_URL}${initialData.iconUrl}`
                }
                alt="Badge Icon Preview"
                className="icon-preview"
              />
            </div>
          )}

          {/* Also show preview when adjusting crop if needed, but the modal approach handles it better */}
          {croppedImage && imageSrc && (
            <div className="preview-wrapper">
              <p>Preview of Adjusted Icon</p>
              <img
                src={croppedImage}
                alt="Adjusted Preview"
                className="icon-preview"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="submit-btn"
          >
            {formik.isSubmitting ? "Processing..." : (initialData ? "Update Badge" : "Create Badge")}
          </button>
        </form>
      </div>
    </div>
  );
}
