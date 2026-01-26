import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AddVideoBanners.css";
import {
  getVideoBannerById,
  updateVideoBanner,
} from "../../services/bannerVideoApiServices";
import { useParams, useNavigate } from "react-router-dom";
import { IoCloudUploadOutline } from "react-icons/io5";

export default function EditVideoBanner() {
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const imageRef = useRef(null);
  const { bannerId } = useParams();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      content: "",
      video: null,
    },
    validationSchema: Yup.object({
      content: Yup.string().required("Banner content is required"),
      video: Yup.mixed().test(
        "fileType",
        "Only video files are allowed",
        (value) =>
          !value || (value && value.type && value.type.startsWith("video/"))
      ),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const formData = new FormData();
      formData.append("content", values.content);
      if (values.video) {
        formData.append("videoFile", values.video);
      }
      const response = await updateVideoBanner(bannerId, formData, setSubmitting);
      if (response) {
        resetForm();
        setVideoPreviewUrl(null);
        navigate("/admin/videoBanners");
      }
    },
  });

  // Load banner data on mount
  useEffect(() => {
    if (bannerId) {
      const fetchBanner = async () => {
        const banner = await getVideoBannerById(bannerId);
        if (banner) {
          formik.setFieldValue("content", banner.content);
          setVideoPreviewUrl(
            `${import.meta.env.VITE_BASE_URL}/${banner.videoUrl}`
          );
        }
      };
      fetchBanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerId]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      formik.setFieldValue("video", file);
      setVideoPreviewUrl(videoUrl);
    } else {
      setVideoPreviewUrl(null);
      formik.setFieldValue("video", null);
    }
  };

  return (
    <div className="admin-add-video-banner-container">
      <AdminHeader title="Edit Video Banner" />

      <div className="admin-add-video-banner-form-container">
        <form className="video-banner-form" onSubmit={formik.handleSubmit}>
          {/* Banner Content */}
          <div className="admin-add-category-form-row">
            <label>Banner Content / Text</label>
            <input
              type="text"
              name="content"
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter banner content"
            />
            {formik.touched.content && formik.errors.content && (
              <p className="error-text">{formik.errors.content}</p>
            )}
          </div>

          {/* Video Upload Area */}
          <div className="admin-add-category-form-row">
            <label>Upload New Video (optional)</label>
            <div className="admin-add-video-banner-file-input-wrapper">
              <IoCloudUploadOutline className="upload-icon" />
              <span className="upload-text">Click to change video file</span>
              <input
                type="file"
                name="video"
                accept="video/*"
                ref={imageRef}
                onChange={handleVideoChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.video && formik.errors.video && (
              <p className="error-text">{formik.errors.video}</p>
            )}
          </div>

          {/* Video Preview */}
          {videoPreviewUrl && (
            <div className="video-preview-wrapper">
              <video key={videoPreviewUrl} autoPlay muted loop controls>
                <source
                  src={videoPreviewUrl}
                  type={formik.values.video?.type || "video/mp4"}
                />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="admin-submit-btn"
          >
            {formik.isSubmitting ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
