import { useEffect, useState, useCallback, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import Cropper from "react-easy-crop";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminEditBanner.css";
import { getCroppedImg } from "../../utils/getCroppedImage";
import { getActiveCountries } from "../../services/configApiService";
import {
  getBannerById,
  updateBannerDetails,
} from "../../services/bannerServices";
import { IoCloudUploadOutline } from "react-icons/io5";

export default function AdminEditBanner() {
  const { bannerId } = useParams();
  const [countries, setCountries] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const imageRef = useRef(null);
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const [countriesRes, bannerRes] = await Promise.all([
          getActiveCountries(),
          getBannerById(bannerId),
        ]);

        if (Array.isArray(countriesRes)) {
          setCountries(countriesRes);
        }

        if (bannerRes) {
          formik.setValues({
            content: bannerRes.content,
            selectedCountries: bannerRes.countries.map((c) => c._id),
            image: bannerRes.imageUrl,
          });
          setPreviewUrl(bannerRes.imageUrl);
        }
      } catch (error) {
        console.error("Error loading banner or countries:", error);
      }
    })();
  }, [bannerId]);

  const countryOptions = countries.map((country) => ({
    label: country.name,
    value: country._id,
  }));

  const formik = useFormik({
    initialValues: {
      image: null,
      content: "",
      selectedCountries: [],
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      content: Yup.string().required("Content is required"),
      selectedCountries: Yup.array()
        .min(1, "Select at least one country")
        .required("Country is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        if (croppedImage) formData.append("image", croppedImage);
        formData.append("content", values.content);
        values.selectedCountries.forEach((id) =>
          formData.append("countryIds[]", id)
        );

        const response = await updateBannerDetails(bannerId, formData);
        if (response) {
          setCroppedImage(null);
          setPreviewUrl(null);
          setImageSrc(null);
          navigate("/admin/banners")
        }
      } catch (err) {
        console.error("Error updating banner:", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      formik.setFieldValue("image", file);
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const submitCroppedImage = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedBlob.file);
      setPreviewUrl(croppedBlob.url);
      setShowCropper(false);
    } catch (e) {
      console.error("Cropping error:", e);
    }
  };

  const cancelCrop = () => {
    setImageSrc(null);
    setShowCropper(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    formik.setFieldValue("image", null);
    if (imageRef.current) imageRef.current.value = "";
    setCroppedImage(null);
    setPreviewUrl(formik.values.image);
  };

  return (
    <div className="admin-edit-banner-main-container">
      <AdminHeader title="Edit Banner" />
      <div className="admin-edit-banner-form-container">
        <form className="banner-form" onSubmit={formik.handleSubmit}>
          {/* Banner Image */}
          <div className="admin-add-category-form-row">
            <label>Update Banner Image (16:9)</label>
            <div className="admin-add-banner-file-input-wrapper">
              <IoCloudUploadOutline className="upload-icon" />
              <span className="upload-text">Click to change banner image</span>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                ref={imageRef}
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Cropper Interface */}
          {showCropper && (
            <div className="cropper-wrapper">
              <div className="cropper-container">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="crop-controls">
                <label>
                  Zoom:
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                </label>
                <div className="crop-buttons">
                  <button type="button" onClick={submitCroppedImage}>
                    Apply Crop
                  </button>
                  <button type="button" onClick={cancelCrop}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && !showCropper && (
            <div className="image-preview">
              <img
                src={
                  previewUrl.startsWith("http") || previewUrl.startsWith("blob:")
                    ? previewUrl
                    : `${import.meta.env.VITE_BASE_URL}/${previewUrl}`
                }
                alt="Preview"
              />
            </div>
          )}

          {/* Banner Content */}
          <div className="admin-add-category-form-row">
            <label htmlFor="content">Banner Content / Text</label>
            <textarea
              id="content"
              name="content"
              rows={3}
              placeholder="Enter text to display on the banner..."
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.content}
            />
            {formik.touched.content && formik.errors.content && (
              <div className="error">{formik.errors.content}</div>
            )}
          </div>

          {/* Target Countries */}
          <div className="admin-add-category-form-row">
            <label htmlFor="selectedCountries">Target Countries</label>
            <Select
              id="selectedCountries"
              name="selectedCountries"
              options={countryOptions}
              isMulti
              value={countryOptions.filter((opt) =>
                formik.values.selectedCountries.includes(opt.value)
              )}
              onChange={(selectedOptions) =>
                formik.setFieldValue(
                  "selectedCountries",
                  selectedOptions.map((opt) => opt.value)
                )
              }
              classNamePrefix="react-select"
              placeholder="Select countries where this banner will appear..."
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
            {formik.touched.selectedCountries &&
              formik.errors.selectedCountries && (
                <p className="admin-banner-error-message">{formik.errors.selectedCountries}</p>
              )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting || (!croppedImage && !previewUrl)}
          >
            {formik.isSubmitting ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
