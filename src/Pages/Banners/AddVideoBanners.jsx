import { useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AddVideoBanners.css";
import { createVideoBanner } from "../../services/bannerVideoApiServices";
import { IoCloudUploadOutline } from "react-icons/io5";

export default function AddVideoBanners() {
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const imageRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      content: "",
      video: null,
    },
    validationSchema: Yup.object({
      content: Yup.string().required("Banner content is required"),
      video: Yup.mixed()
        .required("Video is required")
        .test("fileType", "Only video files are allowed", (value) =>
          value ? value.type.startsWith("video/") : false
        )
        .test(
          "aspectRatio",
          "Video must be in 16:9 aspect ratio",
          async (file) => {
            if (!file) return false;

            const isValid = await new Promise((resolve) => {
              const video = document.createElement("video");
              video.preload = "metadata";

              video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const ratio = video.videoWidth / video.videoHeight;
                resolve(Math.abs(ratio - 16 / 9) < 0.01);
              };

              video.onerror = () => resolve(false);
              video.src = URL.createObjectURL(file);
            });

            return isValid;
          }
        ),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      const formData = new FormData();
      formData.append("content", values.content);
      formData.append("videoFile", values.video);
      const response = await createVideoBanner(formData, setSubmitting);
      if (response) {
        resetForm();
        setVideoPreviewUrl(null);
        if (imageRef.current) imageRef.current.value = "";
      }
    },
  });

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    formik.setFieldValue("video", file);
    setVideoPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="admin-add-video-banner-container">
      <AdminHeader title="Create Video Banner" />

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
              placeholder="e.g. Special Holiday Collection"
            />
            {formik.touched.content && formik.errors.content && (
              <p className="error-text">{formik.errors.content}</p>
            )}
          </div>

          {/* Video Upload Area */}
          <div className="admin-add-category-form-row">
            <label>Upload Video (16:9 aspect ratio)</label>
            <div className="admin-add-video-banner-file-input-wrapper">
              <IoCloudUploadOutline className="upload-icon" />
              <span className="upload-text">Click to upload video file</span>
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
                <source src={videoPreviewUrl} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="admin-submit-btn"
          >
            {formik.isSubmitting ? "Creating..." : "Publish Video Banner"}
          </button>
        </form>
      </div>
    </div>
  );
}
