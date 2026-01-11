import "./LoginPage.css"; // We'll add nice styling here
import NavBar from "../../Components/NavBar/NavBar";
import TopHeader from "../../Components/TopHeader/TopHeader";
import Footer from "../../Components/Footer/Footer";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { loginUser } from "../../services/userApiServices";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  updateCart,
  updateOrderCount,
  updateUserWishList,
} from "../../redux/slices/userSlice";
import EyeCloseIcon from "../../assets/svg/eye-close.svg";
import EyeOpenIcon from "../../assets/svg/eye-open.svg";
import React, { useState } from "react";



const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .test('email', 'Enter a valid email address', (value) => {
        if (!value) return false;
        // For regular users, check standard email format
        return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
      }),

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
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      // Call your login API here
      const response = await loginUser(values, resetForm, setSubmitting);
      if (response && response?.cart) {
        dispatch(login({ user: response?.user, token: response?.token }));
        dispatch(updateCart({ cart: response?.cart }));
        dispatch(updateUserWishList({ user: response?.wishlist?.products }));
        dispatch(updateOrderCount({ orderCount: response.orderCount }));
        navigate(`/${selectedCountry.code}`);
      }
    },
  });

  return (
    <>
      <div className="login-page">
        <TopHeader />
        <NavBar />
      </div>
      <div className="login-container">
        <h1 className="login-title">LOGIN</h1>

        <form className="login-form">
          <div className="login-form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="login-input"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.email}
            />
            {errors?.email && touched?.email && (
              <p className="error-message">{errors?.email}</p>
            )}
          </div>
       <div className="login-form-group" style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="login-input"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.password}
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
                <img src={EyeOpenIcon} alt="Show password" width={20} height={20} />
              ) : (
                <img src={EyeCloseIcon} alt="Hide password" width={20} height={20} />
              )}
            </button>
            {errors?.password && touched?.password && (
              <p className="error-message">{errors?.password}</p>
            )}
          </div>

          <Link to="/forgetPassword" className="forgot-password">
            Forgot password?
          </Link>
          <div className="button-group">
            <button
              className="create-btn"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              Sign in
            </button>
            <button
              className="signin-btn"
              type="button"
              onClick={() => navigate("/register")}
            >
              Create account
            </button>
          </div>
          <div className="return-link">
            <span className="return-icon">↩</span>{" "}
            {/* you can replace with FontAwesome if you want */}
            <Link to={`/${selectedCountry.code}`}>Return to Store</Link>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
