import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./AdminSocialLinks.css";
import { getSocialMediaLinks, postSocialLinks } from "../../services/socialLinksApiService";

export default function AdminSocialLinks() {
  const [initialValues, setInitialValues] = useState({
    facebook: "",
    instagram: "",
    youtube: "",
  });

  useEffect(() => {
    getSocialMediaLinks(setInitialValues)
  }, []);

  // Define validation schema using Yup
  const validationSchema = Yup.object({
    facebook: Yup.string().url("Invalid Facebook URL").nullable(),
    instagram: Yup.string().url("Invalid Instagram URL").nullable(),
    youtube: Yup.string().url("Invalid YouTube URL").nullable(),
  });

  // Initialize Formik for form management
  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      postSocialLinks(values, setInitialValues, setSubmitting);
    },
  });

  return (
    <div className="admin-social-links">
      <h2>Manage Social Media Links</h2>
      <form onSubmit={formik.handleSubmit}>
        {/* Facebook Field */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="facebook">Facebook</label>
          <br />
          <input
            type="url"
            id="facebook"
            name="facebook"
            placeholder="Enter Facebook URL"
            value={formik.values.facebook || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ width: "100%", padding: "8px" }}
          />
          {formik.touched.facebook && formik.errors.facebook && (
            <div style={{ color: "red", fontSize: "12px" }}>
              {formik.errors.facebook}
            </div>
          )}
        </div>

        {/* Instagram Field */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="instagram">Instagram</label>
          <br />
          <input
            type="url"
            id="instagram"
            name="instagram"
            placeholder="Enter Instagram URL"
            value={formik.values.instagram || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ width: "100%", padding: "8px" }}
          />
          {formik.touched.instagram && formik.errors.instagram && (
            <div style={{ color: "red", fontSize: "12px" }}>
              {formik.errors.instagram}
            </div>
          )}
        </div>
        {/* YouTube Field */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="youtube">YouTube</label>
          <br />
          <input
            type="url"
            id="youtube"
            name="youtube"
            placeholder="Enter YouTube URL"
            value={formik.values.youtube || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={{ width: "100%", padding: "8px" }}
          />
          {formik.touched.youtube && formik.errors.youtube && (
            <div style={{ color: "red", fontSize: "12px" }}>
              {formik.errors.youtube}
            </div>
          )}
        </div>

        <button type="submit" disabled={formik.isSubmitting}>
          Save Links
        </button>
      </form>
    </div>
  );
}
