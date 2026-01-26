import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  Box,
  Avatar,
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  deleteBannerByAdmin,
  getAllBanners,
  toggleBannerStatus,
} from "../../services/bannerServices";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AdminBannerList.css";
import { MdOutlineEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Switch from "@mui/material/Switch";
import Swal from "sweetalert2";

const label = { inputProps: { "aria-label": "Switch demo" } };

export default function AdminBannerList() {
  const [bannerData, setBannerData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");

  const navigate = useNavigate();
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    getAllBanners(setBannerData, adminToken);
  }, [adminToken]);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    setPage(0);
  }, [statusFilter, countryFilter]);

  const countryList = [
    ...new Set(bannerData.flatMap((b) => b.countries?.map((c) => c.name))),
  ];

  const filteredBannerData = bannerData.filter((banner) => {
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && banner.isActive) ||
      (statusFilter === "Inactive" && !banner.isActive);

    const matchCountry =
      countryFilter === "All" ||
      banner.countries?.some((c) => c.name === countryFilter);

    return matchStatus && matchCountry;
  });

  const paginatedData = filteredBannerData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  async function deleteBanner(bannerId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete the Banner!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteBannerByAdmin(bannerId);
        if (response) {
          setBannerData(response);
          Swal.fire("Deleted!", "Banner has been deleted.", "success");
        }
      }
    });
  }

  async function ToggleStatus(bannerId) {
    const response = await toggleBannerStatus(bannerId);
    if (response) {
      setBannerData(response);
    }
  }

  return (
    <Box className="admin-banner-list-container">
      <AdminHeader title="Banners" />

      <Box className="admin-banner-list-filters">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: "10px", backgroundColor: "white" }}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Country</InputLabel>
          <Select
            value={countryFilter}
            label="Country"
            onChange={(e) => setCountryFilter(e.target.value)}
            sx={{ borderRadius: "10px", backgroundColor: "white" }}
          >
            <MenuItem value="All">All Countries</MenuItem>
            {countryList.map((name, idx) => (
              <MenuItem key={idx} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <button
          className="admin-add-category-submit-btn-wrapper"
          style={{ width: "auto", margin: 0 }}
          onClick={() => navigate("/admin/addBanner")}
        >
          <Box component="span" sx={{ px: 2, py: 1, backgroundColor: "#edc862", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: 1 }}>
            Add New Banner
          </Box>
        </button>
      </Box>

      <div className="admin-banner-list-section">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Banner Image</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>Countries</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((banner, index) => (
                <TableRow key={index} hover>
                  <TableCell align="center">
                    <Avatar
                      variant="rounded"
                      src={`${import.meta.env.VITE_BASE_URL}/${banner.imageUrl}`}
                      alt="Banner"
                      sx={{
                        width: 140,
                        height: 70,
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        margin: "0 auto",
                        border: "1px solid rgba(0,0,0,0.05)"
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={banner.content} arrow>
                      <Typography
                        variant="body2"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          maxWidth: 280,
                          fontWeight: 500,
                          color: "#444"
                        }}
                      >
                        {banner.content}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {banner.countries?.length > 0 ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {banner.countries.map((c, idx) => (
                          <Chip
                            key={idx}
                            label={c.name}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(237, 200, 98, 0.15)",
                              color: "#8a6d13",
                              fontWeight: 600,
                              borderRadius: "6px",
                              border: "none"
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: "italic" }}>
                        Global / No countries
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <span className={`status-badge ${banner.isActive ? "active" : "inactive"}`}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={banner.isActive}
                          onChange={() => ToggleStatus(banner._id)}
                        />{" "}
                        <span className="slider round"></span>
                      </label>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                      <div
                        className="admin-banner-action-btn edit-btn"
                        onClick={() => navigate(`/admin/editBanner/${banner?._id}`)}
                      >
                        <MdOutlineEdit size={20} color="white" />
                      </div>
                      <div
                        className="admin-banner-action-btn delete-btn"
                        onClick={() => deleteBanner(banner._id)}
                      >
                        <IoTrashOutline size={20} />
                      </div>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="textSecondary">
                      No matching banners found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredBannerData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
          sx={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
        />
      </div>
    </Box>
  );
}
