import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./BrandListPage.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { useEffect, useState } from "react";
import {
  changeBrandStatus,
  deleteBrand,
  getAllBrands,
  updateBrandDetails,
} from "../../services/brandApiServices";
import { IoTrashOutline } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import Swal from "sweetalert2";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useFormik } from "formik";
import * as Yup from "yup";
import ImageCropper from "../../Components/ImageCropper/ImageCropper";

function BrandChangeModal(Props) {
  const { open, handleClose, changeModalData, updateBrandData } = Props;
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImg, setCroppedImg] = useState(null);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: {
      xs: "90%",
      sm: "70%",
      md: "50%",
      lg: "40%",
    },
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 2,
    py: 3,
  };
  const validationSchema = Yup.object({
    brandName: Yup.string()
      .required("Brand name is required")
      .min(2, "Brand name is too short"),

    brandImage: Yup.mixed()
      .nullable()
      .test(
        "fileFormat",
        "Only jpeg, jpg, png, webp formats are allowed.",
        (value) => {
          if (!value) return true; // ✅ Allow empty value
          const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ];
          return allowedTypes.includes(value.type);
        }
      )
      .test("fileSize", "File must be less than 5MB.", (value) => {
        if (!value) return true; // ✅ Allow empty value
        return value.size <= 5 * 1024 * 1024;
      }),
  });

  const formik = useFormik({
    initialValues: {
      brandName: "",
      brandImage: null,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't to update the brand details!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#edc862",
        cancelButtonColor: "#ccc",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const formData = new FormData();
          formData.append("brandName", values.brandName);
          formData.append("brandImage", values.brandImage);
          const response = await updateBrandDetails(
            changeModalData?._id,
            formData,
            setSubmitting,
            resetForm,
            setCroppedImg
          );
          if (response) {
            Swal.fire({
              title: "Updated!",
              text: "Brand details updated successfully!.",
              confirmButtonColor: "#edc862",
              icon: "success",
            });
            resetForm();
            setCroppedImg(null);
            handleClose();
            updateBrandData(response);
          }
        }
      });
    },
  });
  useEffect(() => {
    if (changeModalData) {
      formik.setValues({
        brandName: changeModalData.brandName || "",
      });
      setImageSrc(null);
      setCroppedImg(null);
    }
  }, [changeModalData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
    setCroppedImg(null);
  };
  const handleCropComplete = (cropped) => {
    setCroppedImg(URL.createObjectURL(cropped));
    formik.setFieldValue("brandImage", cropped);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ zIndex: 10 }}
    >
      <Box sx={style}>
        <h2>Update Brand Details</h2>
        <section className="admin-brand-edit-section">
          <div className="admin-add-brand-image-crop-wrapper">
            <label className="admin-add-brand-image-crop">
              Select Brand Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
            {formik.errors.brandImage && formik.touched.brandImage && (
              <div className="error-message">{formik.errors.brandImage}</div>
            )}

            {imageSrc && !croppedImg && (
              <ImageCropper
                imageSrc={imageSrc}
                onCropComplete={handleCropComplete}
                setImageSrc={setImageSrc}
              />
            )}

            {croppedImg && (
              <div className="admin-add-brand-cropped-image-preview">
                <h3>Cropped Image:</h3>
                <img src={croppedImg} alt="Cropped" />
              </div>
            )}
            {changeModalData && !croppedImg && !imageSrc && (
              <img
                className="admin-add-brand-cropped-image-preview"
                src={`${import.meta.env.VITE_BASE_URL}/${
                  changeModalData?.brandImage
                }`}
                alt=""
              />
            )}
          </div>
          <div>
            <input
              type="text"
              name="brandName"
              placeholder="Enter brand name"
              className="admin-add-brand-name-input"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.brandName}
            />
            {formik.errors.brandName && formik.touched.brandName && (
              <div className="error-message">{formik.errors.brandName}</div>
            )}
          </div>
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="admin-add-brand-save-btn"
            onClick={() => formik.handleSubmit()}
          >
            Save brand
          </button>
        </section>
      </Box>
    </Modal>
  );
}

export default function BrandListPage() {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [changeModalData, setChangeModalData] = useState(null);

  useEffect(() => {
    getAllBrands(setBrands);
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredBrands = brands.filter((brand) =>
    brand.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedBrands = filteredBrands.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  async function changeStatus(brandId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't to change the brand status!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#edc862",
      cancelButtonColor: "#ccc",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await changeBrandStatus(brandId);
        if (response) {
          Swal.fire({
            title: "Changed!",
            text: "Brand status has been changed.",
            confirmButtonColor: "#edc862",
            icon: "success",
          });
          setBrands((prevBrands) =>
            prevBrands.map((brand) =>
              brand._id === response._id ? response : brand
            )
          );
        }
      }
    });
  }

  // function to delete the brand
  async function brandDelete(brandId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't to change the brand status!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#edc862",
      cancelButtonColor: "#ccc",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteBrand(brandId);
        if (response) {
          Swal.fire({
            title: "Deleted!",
            text: "Brand has been deleted.",
            confirmButtonColor: "#edc862",
            icon: "success",
          });
          setBrands((prevBrands) =>
            prevBrands.filter((brand) => brand._id !== brandId)
          );
        }
      }
    });
  }

  // function to close the modal open
  function handleClose() {
    setChangeModalOpen(false);
    setChangeModalData(null);
  }

  // function to add updated brand data in the state
  function updateBrandData(updatedBrand) {
    setBrands((prevBrands) =>
      prevBrands.map((brand) =>
        brand._id === updatedBrand._id ? updatedBrand : brand
      )
    );
  }
  return (
    <div className="admin-brand-list-main-container">
      <BrandChangeModal
        open={changeModalOpen}
        handleClose={handleClose}
        changeModalData={changeModalData}
        updateBrandData={updateBrandData}
      />
      <AdminHeader title="Product Brands" />
      <div className="admin-brand-list-section">
        <div className="admin-brand-list-search">
          <input
            placeholder="Search Brand"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <TableContainer
          component={Paper}
          sx={{ boxShadow: "0px 2px 10px #E0E0E0" }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Sl No.</TableCell>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Logo</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBrands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    No brands found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBrands.map((brand, index) => (
                  <TableRow key={brand._id}>
                    <TableCell sx={{ padding: 1 }} align="center">
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell sx={{ padding: 1 }} align="center">
                      {brand?.brandName}
                    </TableCell>
                    <TableCell sx={{ padding: 1 }} align="center">
                      <img
                        className="admin-brand-list-logo"
                        src={`${import.meta.env.VITE_BASE_URL}/${
                          brand.brandImage
                        }`}
                        alt=""
                      />
                    </TableCell>
                    <TableCell align="center">
                      <button
                        className={`admin-brand-table-user-status ${
                          brand?.status ? "active" : "inactive"
                        }`}
                        onClick={() => changeStatus(brand?._id)}
                      >
                        {brand?.status ? "Active" : "Inactive"}
                      </button>
                    </TableCell>
                    <TableCell align="center">
                      <div className="admin-brand-list-actions">
                        <MdOutlineEdit
                          size={20}
                          onClick={() => {
                            setChangeModalOpen(true);
                            setChangeModalData(brand);
                          }}
                        />
                        <IoTrashOutline
                          size={19}
                          onClick={() => brandDelete(brand?._id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredBrands.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </div>
    </div>
  );
}
