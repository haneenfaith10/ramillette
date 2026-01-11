import "./RegisterPage.css";
import NavBar from "../../Components/NavBar/NavBar";
import TopHeader from "../../Components/TopHeader/TopHeader";
import Footer from "../../Components/Footer/Footer";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import {
  getOtp,
  registerUser,
  resendOtp,
} from "../../services/userApiServices";
import { useSelector } from "react-redux";
import OtpInput from "react-otp-input";
import { useEffect, useState } from "react";

function RegisterForm(Props) {
  const { setRegisterPayload, setChanged } = Props;
  const navigate = useNavigate();
  const selectedCountry = useSelector((state) => state.user.selectedCountry);

  const nameRegex = /^[A-Za-z\s]+$/;
  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .matches(nameRegex, "First name can only contain letters and spaces"),
    lastName: Yup.string()
      .matches(nameRegex, "Last name can only contain letters and spaces")
      .nullable(),
    email: Yup.string()
      .required("Email is required")
      .email("Enter a valid email"),

    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    handleBlur,
    touched,
    isSubmitting,
  } = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm, setSubmitting }) => {
      setRegisterPayload(values);
      getOtp(values.email, setChanged, resetForm, setSubmitting);
    },
  });
  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1 className="login-title">SIGN UP</h1>
      <div className="register-form-row">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.firstName}
        />
        {errors?.firstName && touched?.firstName && (
          <p className="error-message">{errors?.firstName}</p>
        )}
      </div>
      <div className="register-form-row">
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.lastName}
        />
        {errors?.lastName && touched?.lastName && (
          <p className="error-message">{errors?.lastName}</p>
        )}
      </div>
      <div className="register-form-row">
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.email}
        />
        {errors?.email && touched?.email && (
          <p className="error-message">{errors?.email}</p>
        )}
      </div>
      <div className="register-form-row">
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.password}
        />
        {errors?.password && touched?.password && (
          <p className="error-message">{errors?.password}</p>
        )}
      </div>

      {/* <label className="checkbox-container">
                        <input type="checkbox" />
                        <span>Register to our newsletter</span>
                    </label> */}

      <div className="button-group">
        <button disabled={isSubmitting} className="create-btn" type="submit">
          {!isSubmitting ? "Create" : "Please Wait..."}
        </button>
        <button className="signin-btn" onClick={() => navigate("/login")}>
          Sign in
        </button>
      </div>

      <div className="return-link">
        <span className="arrow">↶</span>{" "}
        <Link to={`/${selectedCountry.code}`}>Return to Store</Link>
      </div>
    </form>
  );
}

function OtpForm({ registerPayload }) {
  const navigate = useNavigate();
  const [resendTimer, setResendTimer] = useState(30);
  const [resendMessage, setResendMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

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
        await registerUser({ ...registerPayload, otp }, navigate);
      } catch (error) {
        console.log("Otp verification issues!", error);
      }
    },
  });

  const handleResend = async () => {
    try {
      setIsSubmitting(true);
      setResendMessage("");
      const response = await resendOtp(registerPayload.email, setIsSubmitting);
      if (response) {
        setResendTimer(30);
      }
    } catch (error) {
      console.error("Resend OTP failed", error);
      setResendMessage("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="otp-form-main-container">
      <div className="otp-form-inner-container">
        <h2 className="otp-form-title">Enter OTP</h2>
        <p className="info-text">
          The OTP is sent to the email <b>{registerPayload?.email}</b>
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
          <p className="error-message">{formik.errors.otp}</p>
        )}

        <button
          className="otp-form-submit-btn"
          type="button"
          onClick={formik.handleSubmit}
        >
          Submit OTP
        </button>

        <div className="resend-section">
          {resendTimer > 0 ? (
            <p className="resend-timer">
              Resend OTP in{" "}
              <strong>{`${Math.floor(resendTimer / 60)}:${(resendTimer % 60)
                .toString()
                .padStart(2, "0")}`}</strong>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isSubmitting}
              className="resend-btn"
            >
              Resend OTP
            </button>
          )}
          {resendMessage && <p className="resend-message">{resendMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [changed, setChanged] = useState(false);
  const [registerPayload, setRegisterPayload] = useState({});

  return (
    <>
      <div className="register-page">
        <TopHeader />
        <NavBar />
        {!changed ? (
          <RegisterForm
            setRegisterPayload={setRegisterPayload}
            setChanged={setChanged}
          />
        ) : (
          <OtpForm registerPayload={registerPayload} />
        )}
      </div>
      <Footer />
    </>
  );
}
