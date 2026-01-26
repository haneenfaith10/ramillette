import { useEffect, useRef, useState } from "react";
import "./ProfileInfoSection.css";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import profileinfoimage from "../../assets/images/userAvathar.jpg";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserDetails,
  updateUserProfile,
} from "../../services/userApiServices";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateUserProfileDetails } from "../../redux/slices/userSlice";
import Swal from "sweetalert2";

export default function ProfileInfoSection() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [userData, setUserData] = useState({});
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (user.id) {
      getUserDetails(user.id, setUserData);
    }
  }, [user.id]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required("First name is required")
      .min(2, "Too short")
      .max(50, "Too long"),

    lastName: Yup.string().nullable(),

    // email: Yup.string().required("Email is required").email("Invalid email"),

    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^\d{10}$/, "Phone must be 10 digits"),

    password: Yup.string()
      .nullable()
      .min(6, "Password must be at least 6 characters"),
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const formData = new FormData();
      formData.append("firstName", values.firstName);
      formData.append("lastName", values.lastName || "");
      // formData.append("email", values.email);
      formData.append("phone", values.phone);
      if (values.userImage) formData.append("userImage", values.userImage);
      Swal.fire({
        title: "Are you sure?",
        text: "You want to change the Profile",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, change it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await updateUserProfile(
            formData,
            user.id,
            setUserData,
            setSubmitting
          );
          if (response) {
            dispatch(
              updateUserProfileDetails({
                id: response?._id,
                firstName: response?.firstName,
                lastName: response?.lastName,
                email: response?.email,
                userImage: response?.userImage,
                phone: response?.phone,
              })
            );
            Swal.fire({
              title: "Updated!",
              text: "Your profile has been updated.",
              icon: "success",
            });
          }
        }
      });
    },
  });

  useEffect(() => {
    if (Object.keys(userData).length > 0) {
      setFieldValue("firstName", userData.firstName);
      setFieldValue("lastName", userData.lastName);
      setFieldValue("email", userData.email);
      setFieldValue("phone", userData.phone);
    }
  }, [userData, setFieldValue]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFieldValue("userImage", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const profileImage = imagePreview
    ? imagePreview
    : userData?.userImage
    ? `${import.meta.env.VITE_BASE_URL}/${userData.userImage}`
    : profileinfoimage;
  console.log(errors, "errors");

  return (
    <div className="profile-info-section" id="profile-section">
      <div className="avatar-section">
        <img
          src={profileImage}
          alt="avatar"
          className="profile-avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = profileinfoimage;
          }}
        />

        <div>
          <button
            type="button"
            className="change-avatar-btn"
            onClick={handleButtonClick}
          >
            Change avatar
          </button>
          <p className="avatar-note">
            Upload JPG, GIF or PNG image. 300 x 300 required.
          </p>
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className="profile-form-grid">
        <div className="form-group">
          <label>
            First Name <span>*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.firstName && touched.firstName && (
            <p className="error-message">{errors.firstName}</p>
          )}
        </div>
        <div className="form-group">
          <label>
            Last Name <span>*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.lastName && touched.lastName && (
            <p className="error-message">{errors.lastName}</p>
          )}
        </div>
        <div className="form-group">
          <label>
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled
            style={{ cursor: "not-allowed" }}
          />
          {errors.email && touched.email && (
            <p className="error-message">{errors.email}</p>
          )}
        </div>
        <div className="form-group">
          <label>
            Phone Number <span>*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="number"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.phone && touched.phone && (
            <p className="error-message">{errors.phone}</p>
          )}
        </div>
      </div>
      <button
        className="update-profile-btn"
        type="button"
        disabled={isSubmitting}
        onClick={() => handleSubmit()}
      >
        Update profile
      </button>
    </div>
  );
}
