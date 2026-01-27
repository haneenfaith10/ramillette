import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
} from "@mui/material";
import { IoTrashOutline } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AddProvider,
  deleteProvider,
  getAllProviders,
  updateProvider,
} from "../../services/shippingProviderApi";
import Swal from "sweetalert2";

export default function ShippingProviderPage() {
  const [providers, setProviders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [changed, setChanged] = useState(false);
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    getAllProviders(setProviders,adminToken);
  }, [changed,adminToken]);

  const formik = useFormik({
    initialValues: {
      providerName: "",
    },
    enableReinitialize: true, // allow setting new values dynamically
    validationSchema: Yup.object({
      providerName: Yup.string()
        .trim()
        .required("Provider name is required")
        .min(2, "Provider name too short"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      if (editingId) {
        const res = await updateProvider(editingId, values.providerName);
        if (res?.isSuccess) {
          Swal.fire("Updated!", "Provider has been updated.", "success");
          setEditingId(null);
          resetForm();
          setChanged((prev) => !prev);
        }
      } else {
        const response = await AddProvider(values, setSubmitting);
        if (response) {
          resetForm();
          setProviders((prev) => [response,...prev]);
        }
      }
    },
  });

  const handleEdit = (provider) => {
    formik.setFieldValue("providerName", provider.providerName);
    setEditingId(provider._id);
  };

  const handleCancelEdit = () => {
    formik.resetForm();
    setEditingId(null);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this provider?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await deleteProvider(id);
        if (res?.isSuccess) {
          setChanged((prev) => !prev);
          if (editingId === id) handleCancelEdit();
        }
      }
    });
  };

  return (
    <Box 
      sx={{ 
        p: 4,
        background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
        minHeight: "100vh",
        animation: "fadeIn 0.5s ease-in",
        "@keyframes fadeIn": {
          from: {
            opacity: 0,
            transform: "translateY(10px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          fontWeight: 700,
          fontSize: "2rem",
          mb: 3,
          background: "linear-gradient(135deg, #edc862 0%, #d4b050 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Shipping Providers
      </Typography>

      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{ 
          display: "flex", 
          gap: 2, 
          mb: 3,
          background: "white",
          padding: 2,
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "2px solid rgba(237, 200, 98, 0.2)",
        }}
      >
        <TextField
          label="Provider Name"
          name="providerName"
          fullWidth
          value={formik.values.providerName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.providerName && Boolean(formik.errors.providerName)
          }
          helperText={formik.touched.providerName && formik.errors.providerName}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "& fieldset": {
                borderColor: "#f5e6c8",
                borderWidth: 2,
              },
              "&:hover fieldset": {
                borderColor: "#edc862",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#edc862",
                boxShadow: "0 0 0 4px rgba(237, 200, 98, 0.1)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "#64748b",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#edc862",
            },
          }}
        />

        {editingId ? (
          <>
            <Button
              type="submit"
              variant="contained"
              sx={{ 
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                height: "3.5rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #edc862 0%, #d4b050 100%)",
                color: "#1a1a1a",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(237, 200, 98, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #d4b050 0%, #edc862 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(237, 200, 98, 0.4)",
                },
                "&:disabled": {
                  opacity: 0.6,
                },
              }}
              disabled={formik.isSubmitting}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancelEdit}
              sx={{ 
                height: "3.5rem",
                borderRadius: "12px",
                borderColor: "#e5e7eb",
                color: "#475569",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                "&:hover": {
                  borderColor: "#d1d5db",
                  background: "#f9fafb",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            type="submit"
            variant="contained"
            sx={{ 
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              height: "3.5rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #edc862 0%, #d4b050 100%)",
              color: "#1a1a1a",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(237, 200, 98, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #d4b050 0%, #edc862 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(237, 200, 98, 0.4)",
              },
              "&:disabled": {
                opacity: 0.6,
              },
            }}
            disabled={formik.isSubmitting}
          >
            Add
          </Button>
        )}
      </Box>

      <Paper 
        sx={{ 
          p: 3,
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          border: "2px solid rgba(237, 200, 98, 0.2)",
          background: "white",
        }}
      >
        {providers.length === 0 ? (
          <Typography
            sx={{
              textAlign: "center",
              padding: 3,
              color: "#64748b",
              fontSize: "1rem",
            }}
          >
            No providers found.
          </Typography>
        ) : (
          providers.map((provider, index) => (
            <Box
              key={provider._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: index !== providers.length - 1 ? "1px solid #f1f5f9" : "none",
                py: 2,
                px: 1,
                transition: "all 0.3s ease",
                borderRadius: "8px",
                "&:hover": {
                  background: "linear-gradient(90deg, rgba(237, 200, 98, 0.08) 0%, rgba(212, 176, 80, 0.08) 100%)",
                  transform: "scale(1.01)",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "#334155",
                }}
              >
                {provider.providerName}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton 
                  onClick={() => handleEdit(provider)}
                  sx={{
                    color: "#edc862",
                    "&:hover": {
                      background: "rgba(237, 200, 98, 0.1)",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <MdEdit />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(provider._id)}
                  sx={{
                    color: "#f5576c",
                    "&:hover": {
                      background: "rgba(245, 87, 108, 0.1)",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <IoTrashOutline />
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
}
