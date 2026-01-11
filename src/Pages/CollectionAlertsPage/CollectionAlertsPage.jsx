import { useEffect, useState } from "react";
import "./CollectionAlertsPage.css";
import { getActiveCountries } from "../../services/configApiService";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import { FiEdit2, FiTrash } from "react-icons/fi";
import {
  addCollectionAlert,
  CountryAlerts,
  deleteCollectionAlert,
  updateCollectionAlert,
} from "../../services/alertApiService";
import * as Yup from "yup";
import { useFormik } from "formik";
import EmptyData from "../../assets/svg/empty-data.svg";
import Swal from "sweetalert2";

export default function CollectionAlertsPage() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [changed, setChanged] = useState(false);
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    (async () => {
      const response = await getActiveCountries();
      if (response) setCountries(response);
    })();
  }, []);

  const CollectionAlertSchema = Yup.object().shape({
    message: Yup.string()
      .required("Alert message is required")
      .min(5, "Minimum 5 letters required"),
  });

  useEffect(() => {
    if (selectedCountry) {
      CountryAlerts(selectedCountry, setAlerts,adminToken);
    }
  }, [selectedCountry, changed,adminToken]);

  const formik = useFormik({
    initialValues: {
      message: "",
    },
    validationSchema: CollectionAlertSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      if (editMode && editId) {
        const response = await updateCollectionAlert({
          alertId: editId,
          content: values.message,
        },adminToken);
        if (response) {
          setChanged((prev) => !prev);
          resetForm();
          setEditMode(false);
          setEditId(null);
        }
      } else {
        await addCollectionAlert(
          {
            countryId: selectedCountry,
            content: values.message,
          },
          setAlerts,
          resetForm,
          setSubmitting,
          adminToken
        );
      }
    },
  });

  const resetInput = () => {
    formik.resetForm();
    setEditMode(false);
    setEditId(null);
  };
  const handleEdit = (alert) => {
    setEditMode(true);
    setEditId(alert._id);
    formik.setFieldValue("message", alert.content);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete the alert!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteCollectionAlert(id);
        if (response) {
          setChanged((prev) => !prev);
          Swal.fire({
            title: "Deleted!",
            text: "The alert has been deleted.",
            icon: "success",
          });
        }
      }
    });
  };

  return (
    <div className="admin-config-collection-alerts-wrapper">
      <AdminHeader title="Collection Alerts" />

      <div className="admin-config-collection-country-wrapper">
        <h4>Choose Country</h4>
        <select
          name="country"
          id="country"
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            resetInput();
          }}
        >
          <option value="" hidden>
            Select
          </option>
          {countries.map((country, index) => (
            <option value={country._id} key={index}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCountry && (
        <div className="admin-config-collection-alert-content-wrapper">
          <form
            onSubmit={formik.handleSubmit}
            className="collection-alert-input"
          >
            <div style={{ width: "100%" }} className="collection-alert-input">
              <input
                type="text"
                name="message"
                placeholder="Enter collection alert message"
                value={formik.values.message}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.message && formik.errors.message && (
                <div style={{ fontSize: "12px", color: "red" }}>
                  {formik.errors.message}
                </div>
              )}
            </div>
            <button type="submit" disabled={formik.isSubmitting}>
              {editMode ? "Update Alert" : "Add Alert"}
            </button>
          </form>

          <div className="collection-alert-list">
            {alerts && alerts.length > 0
              ? alerts.map((alert) => (
                  <div key={alert._id} className="collection-alert-item">
                    <p>{alert.content}</p>
                    <div className="alert-actions">
                      <FiEdit2 onClick={() => handleEdit(alert)} />
                      <FiTrash onClick={() => handleDelete(alert._id)} />
                    </div>
                  </div>
                ))
              : selectedCountry && (
                  <div className="no-alerts">
                    <img
                      src={EmptyData}
                      alt="No Alerts"
                      className="no-alerts-image"
                    />
                    <p>No collection alerts found for this country.</p>
                  </div>
                )}
          </div>
        </div>
      )}
    </div>
  );
}
