import { useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AddVideoBanners.css";
import { createVideoBanner } from "../../services/bannerVideoApiServices";

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
        imageRef.current = null;
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
      <AdminHeader title="Create video banner" />

      <form className="video-banner-form" onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label>Banner Content</label>
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

        <div className="form-group">
          <label>Upload Video (16:9 aspect ratio)</label>
          <input
            type="file"
            name="video"
            accept="video/*"
            ref={imageRef}
            onChange={handleVideoChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.video && formik.errors.video && (
            <p className="error-text">{formik.errors.video}</p>
          )}
        </div>

        {videoPreviewUrl && (
          <video width="320" autoPlay controls>
            <source src={videoPreviewUrl} />
            Your browser does not support the video tag.
          </video>
        )}

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="admin-submit-btn"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
