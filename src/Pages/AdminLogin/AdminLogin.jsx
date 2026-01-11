import "./AdminLogin.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { adminLogin } from "../../services/adminApiServices";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import EyeCloseIcon from "../../assets/svg/eye-close.svg";
import EyeOpenIcon from "../../assets/svg/eye-open.svg";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false); // <-- Add this line

  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    userName: Yup.string()
      .required("userName is required")
      .min(3, "userName must be at least 3 characters"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    touched,
    isSubmitting,
  } = useFormik({
    initialValues: {
      userName: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      // Call the login function from the API service
      adminLogin(values, resetForm, setSubmitting, navigate);
      // adminRegister(values)
    },
  });

  return (
    <div className="admin-login-container">
      <h1 className="admin-login-title">LOGIN</h1>
      <form className="admin-login-form">
        <div className="admin-login-form-group">
          <input
            type="text"
            name="userName"
            placeholder="UserName"
            className="login-input"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.userName}
          />
          {errors?.userName && touched?.userName && (
            <p className="error-message">{errors?.userName}</p>
          )}
        </div>
        <div
          className="admin-login-form-group"
          style={{ position: "relative" }}
        >
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="login-input"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.password}
            style={{ paddingRight: "40px" }} // Add space for the icon
          />
          <button
            type="button"
            className="eye-icon-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            style={{
              position: "absolute",
              right: "18px",
              top: "20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              zIndex: 2,
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              // Eye open SVG
              <img
                src={EyeOpenIcon}
                alt="Show password"
                width={20}
                height={20}
              />
            ) : (
              // Eye closed SVG
              <img
                src={EyeCloseIcon}
                alt="Hide password"
                width={20}
                height={20}
              />
            )}
          </button>
          {errors?.password && touched?.password && (
            <p className="error-message">{errors?.password}</p>
          )}
        </div>
        <div className="admin-button-group">
          <button
            type="submit"
            className="create-btn"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  );
}
