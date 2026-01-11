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
    <Box className="admin-banner-list-container" p={3}>
      <AdminHeader title="Banners" />

      <Box display="flex" gap={2} mb={2}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Country</InputLabel>
          <Select
            value={countryFilter}
            label="Country"
            onChange={(e) => setCountryFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {countryList.map((name, idx) => (
              <MenuItem key={idx} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={4} sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Banner Image</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Content</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Countries</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((banner, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{
                    transition: "0.2s",
                    "&:hover": { backgroundColor: "#f0f7ff" },
                  }}
                >
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={`${import.meta.env.VITE_BASE_URL}/${
                        banner.imageUrl
                      }`}
                      alt="Banner"
                      sx={{
                        width: 120,
                        height: 70,
                        borderRadius: 2,
                        boxShadow: 2,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={banner.content}>
                      <Typography
                        variant="body2"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          maxWidth: 300,
                        }}
                      >
                        {banner.content}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {banner.countries?.length > 0 ? (
                      banner.countries.map((c, idx) => (
                        <Chip
                          key={idx}
                          label={c.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No countries
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={banner.isActive}
                        onChange={() => ToggleStatus(banner._id)}
                      />{" "}
                      <span className="slider round"></span>
                    </label>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <MdOutlineEdit
                        size={18}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate(`/admin/editBanner/${banner?._id}`)
                        }
                      />
                      <IoTrashOutline
                        size={18}
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => deleteBanner(banner._id)}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No banners found.
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
        />
      </Paper>
    </Box>
  );
}
