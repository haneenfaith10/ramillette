import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  changeVideoBannerStatus,
  deleteVideoBanner,
  getAllVideoBanners,
} from "../../services/bannerVideoApiServices";
import { IoTrashOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import { MdOutlineEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AdminVideoBanner.css";

export default function AdminVideoBanner() {
  const [videoBanners, setVideoBanners] = useState([]);
  const [filteredBanners, setFilteredBanners] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const navigate = useNavigate();
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    getAllVideoBanners((data) => {
      setVideoBanners(data);
      setFilteredBanners(data);
    });
  }, []);

  useEffect(() => {
    filterAndSearch();
    setPage(0); // Reset to first page when filtering
  }, [searchQuery, statusFilter, videoBanners]);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);

  const filterAndSearch = () => {
    let filtered = [...videoBanners];

    if (statusFilter !== "All") {
      filtered = filtered.filter((banner) =>
        statusFilter === "Active" ? banner.isActive : !banner.isActive
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((banner) =>
        banner.content?.toLowerCase().includes(query)
      );
    }

    setFilteredBanners(filtered);
  };

  const displayedBanners = filteredBanners.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  async function deleteBanner(bannerId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete the Banner Video!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteVideoBanner(bannerId);
        if (response) {
          setVideoBanners(response);
          Swal.fire({
            title: "Deleted!",
            text: "Your banner has been deleted.",
            icon: "success",
          });
        }
      }
    });
  }

  function changeStatus(bannerId) {
    if (adminToken) {
      changeVideoBannerStatus(bannerId, adminToken, setVideoBanners);
    }
  }

  return (
    <Box className="admin-video-banner-container">
      <AdminHeader title="Video Banners" />

      {/* Filters & Actions Row */}
      <Box className="admin-banner-list-filters">
        <TextField
          label="Search Content"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ backgroundColor: "white", borderRadius: "10px", minWidth: 250, "& fieldset": { borderRadius: "10px" } }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
            sx={{ borderRadius: "10px", backgroundColor: "white" }}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <button
          className="admin-add-category-submit-btn-wrapper"
          style={{ width: "auto", margin: 0, border: "none" }}
          onClick={() => navigate("/admin/createVideoBanner")}
        >
          <Box component="span" sx={{ px: 2, py: 1.2, backgroundColor: "#edc862", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: 1, color: "#333", boxShadow: "0 4px 12px rgba(237, 200, 98, 0.3)" }}>
            Add New Video Banner
          </Box>
        </button>
      </Box>

      <div className="admin-banner-list-section">
        {filteredBanners.length === 0 ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              No video banners found.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Video</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedBanners.map((banner) => (
                  <TableRow key={banner._id} hover>
                    <TableCell align="center">
                      <Box className="banner-video-thumbnail" sx={{ width: 200, height: 112, margin: "0 auto" }}>
                        <video width="100%" height="100%" style={{ objectFit: "cover" }}>
                          <source
                            src={`${import.meta.env.VITE_BASE_URL
                              }/${banner.videoUrl.replace(/\\/g, "/")}`}
                            type="video/mp4"
                          />
                        </video>
                      </Box>
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
                            maxWidth: 300,
                            fontWeight: 500,
                            color: "#444"
                          }}
                        >
                          {banner.content}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        {new Date(banner.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        {new Date(banner.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <span className={`status-badge ${banner.isActive ? "active" : "inactive"}`}>
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={banner?.isActive}
                            onChange={() => changeStatus(banner._id)}
                          />{" "}
                          <span className="slider round"></span>
                        </label>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <div
                          className="admin-banner-action-btn edit-btn"
                          onClick={() => navigate(`/admin/editVideoBanner/${banner._id}`)}
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
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {filteredBanners.length > 5 && (
          <TablePagination
            component="div"
            count={filteredBanners.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
          />
        )}
      </div>
    </Box>
  );
}
