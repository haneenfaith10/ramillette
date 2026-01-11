import "./ForgetPasswordPage.css";
import { Link, useNavigate } from "react-router-dom";
import Topheader from "../../Components/TopHeader/TopHeader";
import NavBar from "../../Components/NavBar/NavBar";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import Footer from "../../Components/Footer/Footer";
import {
  changePassword,
  getOtpForForgetPassword,
  verifyOtp,
} from "../../services/userApiServices";
import OtpInput from "react-otp-input";

function ForgetPassword(Props) {
  const { setState, setEmail } = Props;
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: (values, { setSubmitting }) => {
      // Call your forgot password API here
      setEmail(values.email);
      getOtpForForgetPassword(values.email, setState, setSubmitting);
    },
  });
  return (
    <div className="forget-password-container">
      <div className="forget-password-box">
        <h2 className="forget-password-title">Forgot Your Password?</h2>
        <p className="forget-password-subtext">
          Enter your email address and we’ll send you a link to reset your
          password.
        </p>

        <form onSubmit={formik.handleSubmit} className="forget-password-form">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="forget-password-input"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="forget-error-message">{formik.errors.email}</p>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="forget-password-submit"
          >
            {formik.isSubmitting ? "Please Wait" : " Send OTP"}
          </button>
        </form>

        <div className="back-to-login">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

function ChangePassword(Props) {
  const { email } = Props;

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .required("New password is required")
        .min(6, "Password must be at least 6 characters"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
        .required("Confirm your new password"),
    }),
    onSubmit: (values, { setSubmitting }) => {
      changePassword(
        { newPassword: values.newPassword, email },
        navigate,
        setSubmitting
      );
    },
  });

  return (
    <div>
      <div className="change-password-container">
        <div className="change-password-box">
          <h2 className="change-password-title">Change Password</h2>

          <form onSubmit={formik.handleSubmit} className="change-password-form">
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="change-password-input"
            />
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="forget-error-message">{formik.errors.newPassword}</p>
            )}

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="change-password-input"
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="forget-error-message">{formik.errors.confirmPassword}</p>
              )}

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="change-password-submit"
            >
              {formik.isSubmitting ? "Updating" : "Update"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function OtpForm(Props) {
  const { email, setState } = Props;

  const validationSchema = Yup.object({
    otp: Yup.string()
      .required("OTP is required")
      .matches(/^\d{6}$/, "OTP must be exactly 6 digits"),
  });

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema,
    onSubmit: async ({ otp }) => {
      try {
        await verifyOtp({ email, otp }, setState, formik.setSubmitting);
      } catch (error) {
        console.log("Otp verification  issues!", error);
      }
    },
  });
  return (
    <div className="otp-form-main-container">
      <div className="otp-form-inner-container">
        <h2 className="otp-form-title">Enter OTP</h2>
        <p className="info-text">
          The OTP is sent to the email <b>{email}</b>
        </p>

        <OtpInput
          value={formik.values.otp}
          onChange={(value) => {
            const numericOtp = value.replace(/\D/g, "");
            formik.setFieldValue("otp", numericOtp);
          }}
          numInputs={6}
          renderSeparator={<span></span>}
          renderInput={(props) => (
            <input {...props} type="number" onBlur={formik.handleBlur("otp")} />
          )}
          inputStyle={{
            width: "50px",
            height: "50px",
            fontSize: "20px",
            borderRadius: "8px",
            border: "2px solid var(--secondary-color)",
            margin: "0 5px",
            textAlign: "center",
          }}
          focusStyle={{
            border: "2px solid var(--secondary-color)",
            outline: "none",
          }}
        />

        {formik.touched.otp && formik.errors.otp && (
          <p className="forget-error-message">{formik.errors.otp}</p>
        )}
        {/* {errorMsg && <p className="forget-error-message">{errorMsg}</p>} */}

        <button
          className="otp-form-submit-btn"
          type="button"
          disabled={formik.isSubmitting}
          onClick={formik.handleSubmit}
        >
          {formik.isSubmitting ? "Submitting" : " Submit OTP"}
        </button>
      </div>
    </div>
  );
}

export default function ForgetPasswordPage() {
  const [state, setState] = useState("forget");
  const [email, setEmail] = useState("");
  return (
    <div>
      <Topheader />
      <NavBar />
      {state === "forget" && (
        <ForgetPassword setState={setState} setEmail={setEmail} />
      )}
      {state === "otp" && <OtpForm email={email} setState={setState} />}
      {state === "change" && <ChangePassword email={email} />}
      <Footer />
    </div>
  );
}
