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
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Shipping Providers
      </Typography>

      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{ display: "flex", gap: 2, mb: 3 }}
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
        />

        {editingId ? (
          <>
            <Button
              type="submit"
              variant="contained"
              color="success"
              sx={{ textTransform: "none", height: "3.5rem" }}
              disabled={formik.isSubmitting}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              onClick={handleCancelEdit}
              sx={{ height: "3.5rem" }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            type="submit"
            variant="contained"
            sx={{ textTransform: "none", height: "3.5rem" }}
            disabled={formik.isSubmitting}
          >
            Add
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2 }}>
        {providers.length === 0 ? (
          <Typography>No providers found.</Typography>
        ) : (
          providers.map((provider) => (
            <Box
              key={provider._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee",
                py: 1,
              }}
            >
              <Typography>{provider.providerName}</Typography>
              <Box>
                <IconButton onClick={() => handleEdit(provider)}>
                  <MdEdit color="blue" />
                </IconButton>
                <IconButton onClick={() => handleDelete(provider._id)}>
                  <IoTrashOutline color="red" />
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
}
