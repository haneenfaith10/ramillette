import React, { useEffect, useState } from "react";
import Topheader from "../../Components/TopHeader/TopHeader";
import NavBar from "../../Components/NavBar/NavBar";
import Footer from "../../Components/Footer/Footer";
import "./ContactPage.css";
import {
  getSettingsData,
  sendContactForm,
} from "../../services/settingsApiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { useDispatch } from "react-redux";
import { setAppLoading } from "../../redux/slices/userSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
// import { sendContactForm } from "../../services/contactApiService"; // you should create this API

export default function ContactPage() {
  const [contactDetails, setContactDetails] = useState();
  const [socialLinks, setSocialLinks] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        await getSettingsData(setContactDetails, setSocialLinks);
      } finally {
        dispatch(setAppLoading(false));
      }
    })();
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string().required("Phone number is required"),
      subject: Yup.string().required("Subject is required"),
      message: Yup.string().required("Message is required"),
    }),
    onSubmit: (values, { resetForm, setSubmitting }) => {
      setSubmitting(true);
      sendContactForm(values, resetForm, setSubmitting);
    },
  });

  return (
    <>
      <div className="contact-wrapper">
        <Topheader />
        <NavBar />
        <div className="contact-page">
          <div className="container">
            <div className="contact-header">
              <h2>Contact Us</h2>
              <p>
                We're all ears for your thoughts and suggestions. Drop us an
                email or fill out the form below to get in touch with us!
              </p>
            </div>

            <div className="contact-container">
              <form className="contact-form" onSubmit={formik.handleSubmit}>
                <div className="form-row">
                  <div className="contact-form-row-input-wrapper">
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="error">{formik.errors.name}</p>
                    )}
                  </div>
                  <div className="contact-form-row-input-wrapper">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="error">{formik.errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="contact-form-row-input-wrapper">
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone number"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="error">{formik.errors.phone}</p>
                    )}
                  </div>
                  <div className="contact-form-row-input-wrapper">
                    <select
                      name="subject"
                      value={formik.values.subject}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.values.subject === ""
                          ? "placeholder-selected"
                          : ""
                      }
                    >
                      <option value="">Subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Support">Support</option>
                      <option value="Feedback">Feedback</option>
                    </select>
                    {formik.touched.subject && formik.errors.subject && (
                      <p className="error">{formik.errors.subject}</p>
                    )}
                  </div>
                </div>

                <div
                  className="contact-form-row-input-wrapper"
                  style={{ marginBottom: "20px" }}
                >
                  <textarea
                    name="message"
                    placeholder="Message"
                    value={formik.values.message}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.message && formik.errors.message && (
                    <p className="error">{formik.errors.message}</p>
                  )}
                </div>

                <button type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? "Sending Message" : "Send message"}
                </button>
              </form>

              <div className="contact-info">
                <div className="info-section">
                  <h4>Address</h4>
                  <p>{contactDetails?.companyAddress}</p>
                </div>
                <div className="info-section">
                  <h4>Email</h4>
                  <p>
                    <a href={`mailto:${contactDetails?.companyEmail}`}>
                      {contactDetails?.companyEmail}
                    </a>
                  </p>
                  <p>
                    <a href={`mailto:${contactDetails?.companySupportEmail}`}>
                      {contactDetails?.companySupportEmail}
                    </a>
                  </p>
                </div>
                <div className="info-section">
                  <h4>Phone</h4>
                  <p>
                    <a href={`tel:${contactDetails?.companyPhoneNumber}`}>
                      {contactDetails?.companyPhoneNumber}
                    </a>
                  </p>
                  <p>mon – fri: 9 a.m – 6 p.m</p>
                </div>
                <div className="info-section">
                  <h4>Follow Us</h4>
                  <div className="social-icons">
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                    >
                      <FontAwesomeIcon icon={faFacebookF} />
                    </a>
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                    >
                      <FontAwesomeIcon icon={faInstagram} />
                    </a>
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                    >
                      <FontAwesomeIcon icon={faYoutube} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <p className="disclaimer">
              This site is protected by hCaptcha and the hCaptcha{" "}
              <a href="#">Privacy Policy</a> and{" "}
              <a href="#">Terms of Service</a> apply.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
