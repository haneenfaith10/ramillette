import {
  addCountry,
  deleteCountry,
  getCountries,
  setPrimaryCountry,
  toggleCountryStatus,
  updateCountry,
} from "../../../services/configApiService";
import "./CountryConfiguration.css";
import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

export default function CountryConfiguration() {
  const [countries, setCountries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [flagFile, setFlagFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const imageRef = useRef();
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    fetchCountries(adminToken);
  }, [adminToken]);

  const fetchCountries = async (adminToken) => {
    try {
      const response = await getCountries(adminToken);
      if (response && response.data) {
        setCountries(response.data.countries);
      } else {
        setCountries([]);
      }
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      setCountries([]);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      code: "",
      currency: "",
      priceLabel: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Country name is required"),
      code: Yup.string()
        .required("Country code is required")
        .max(3, "Code must be 3 characters or less"),
      currency: Yup.string().required("Currency is required"),
      priceLabel: Yup.string().required("Price Label is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("code", values.code);
        formData.append("currency", values.currency);
        formData.append("priceLabel", values.priceLabel);
        if (flagFile) {
          formData.append("flag", flagFile);
        }
        let response;
        if (editing) {
          response = await updateCountry(editing, formData);
        } else {
          response = await addCountry(formData);
        }

        if (response) {
          resetForm();
          setEditing(null);
          setFlagFile(null);
          setPreviewUrl(null);
          imageRef.current.value = null; // Reset file input
          fetchCountries(adminToken);
          Swal.fire({
            icon: "success",
            title: editing ? "Country updated" : "Country added",
            timer: 1500,
          });
        }
      } catch (error) {
        console.error("Failed to submit country:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to submit country data",
        });
      }
    },
  });

  // When editing, populate form and preview with current data
  const handleEdit = (country) => {
    formik.setValues({
      name: country.name,
      code: country.code,
      currency: country.currency,
      priceLabel: country.priceLabel || "",
    });
    setEditing(country._id);
    setFlagFile(null);
    setPreviewUrl(`${import.meta.env.VITE_BASE_URL}${country.flagUrl}` || null);
    imageRef.current.value = null; // Clear previous file input
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this country?")) {
      await deleteCountry(id);
      fetchCountries(adminToken);
    }
  };

  async function handleToggleStatus(country) {
    const response = await toggleCountryStatus(country._id, !country.isActive);
    if (response) {
      fetchCountries(adminToken);
    }
  }

  const handleSetPrimary = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to change the primary country",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await setPrimaryCountry(id);
          if (response) {
            localStorage.setItem(
              "RemilletteAdminCountry",
              response?.country?.name
            );
            fetchCountries(adminToken);
            Swal.fire({
              title: "Changed!",
              text: "The primary country has been changed",
              icon: "success",
            });
          }
        } catch (error) {
          console.error("Failed to set primary country:", error);
        }
      }
    });
  };

  return (
    <div className="country-config">
      <h2>Manage Countries</h2>
      <form
        onSubmit={formik.handleSubmit}
        className="country-form"
        encType="multipart/form-data"
      >
        <div>
          <input
            name="name"
            placeholder="Country Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="form-error">{formik.errors.name}</div>
          )}
        </div>
        <div>
          <input
            name="code"
            placeholder="Country Code"
            value={formik.values.code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            maxLength={3}
            // disabled={editing !== null} // Optional: disable code editing when updating
          />
          {formik.touched.code && formik.errors.code && (
            <div className="form-error">{formik.errors.code}</div>
          )}
        </div>
        <div>
          <input
            name="currency"
            placeholder="Currency"
            value={formik.values.currency}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.currency && formik.errors.currency && (
            <div className="form-error">{formik.errors.currency}</div>
          )}
        </div>
        <div>
          <input
            name="priceLabel"
            placeholder="Price Label (e.g., ₹, $, €)"
            value={formik.values.priceLabel}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.priceLabel && formik.errors.priceLabel && (
            <div className="form-error">{formik.errors.priceLabel}</div>
          )}
        </div>

        <div>
          {/* Flag upload input */}
          <input
            type="file"
            name="flag"
            accept="image/*"
            ref={imageRef}
            onChange={(e) => {
              const file = e.currentTarget.files[0];
              setFlagFile(file);
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
              } else {
                setPreviewUrl(null);
              }
            }}
          />

          {/* Image preview */}
          {previewUrl && (
            <div style={{ marginTop: "10px", marginLeft: "20px" }}>
              <strong>Flag Preview:</strong>
              <br />
              <img
                src={previewUrl}
                alt="Flag Preview"
                style={{
                  width: "80px",
                  height: "auto",
                  borderRadius: "4px",
                  marginTop: "5px",
                }}
              />
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn">
          {editing ? "Update" : "Add"} Country
        </button>

        {editing && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setEditing(null);
              formik.resetForm();
              setFlagFile(null);
              setPreviewUrl(null);
              imageRef.current.value = null;
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {countries && countries.length > 0 ? (
        <table className="country-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Currency</th>
              <th>Flag</th>
              <th>Price Label</th>
              <th>Active</th>
              <th>Status</th>
              <th>Make it primary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.code}</td>
                <td>{c.currency}</td>
                <td>
                  {c.flagUrl ? (
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}${c.flagUrl}`}
                      alt={`${c.name} Flag`}
                      style={{
                        width: "40px",
                        height: "auto",
                        // borderRadius: "3px",
                        border: "1px solid black",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    "No flag"
                  )}
                </td>
                <td>{c.priceLabel || "-"}</td>
                <td>{c.isActive ? "Yes" : "No"}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={c.isActive}
                      onChange={() => handleToggleStatus(c)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={c.isPrimary}
                      onChange={() => !c.isPrimary && handleSetPrimary(c._id)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(c)}>
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(c._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data-fallback">No country found.</div>
      )}
    </div>
  );
}
