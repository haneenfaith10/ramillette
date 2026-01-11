import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AddVideoBanners.css";
import {
  getVideoBannerById,
  updateVideoBanner,
  //   updateVideoBanner,
} from "../../services/bannerVideoApiServices";
import { useParams } from "react-router-dom";

export default function EditVideoBanner() {
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const imageRef = useRef(null);
  const { bannerId } = useParams();

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
      const response = updateVideoBanner(bannerId, formData, setSubmitting);
      if (response) {
        resetForm();
        setVideoPreviewUrl();
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
      <AdminHeader title="Edit video banner" />

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
          <label>Upload New Video (optional)</label>
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
          <video key={videoPreviewUrl} width="320" controls>
            <source
              src={videoPreviewUrl}
              type={formik.values.video?.type || "video/mp4"}
            />
            Your browser does not support the video tag.
          </video>
        )}

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="admin-submit-btn"
        >
          Update
        </button>
      </form>
    </div>
  );
}
