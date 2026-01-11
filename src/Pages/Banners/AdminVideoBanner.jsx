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
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Video Banners
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <TextField
          label="Search Content"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredBanners.length === 0 ? (
        <Box
          sx={{
            width: "100%",
            height: "5rem",
            backgroundColor: "#e3e3e34d",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography sx={{ color: "#ccc" }}>
            No video banners found.
          </Typography>
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Video</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Content</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Created At</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedBanners.map((banner) => (
                  <TableRow key={banner._id}>
                    <TableCell>
                      <video width="180" controls>
                        <source
                          src={`${
                            import.meta.env.VITE_BASE_URL
                          }/${banner.videoUrl.replace(/\\/g, "/")}`}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </TableCell>
                    <TableCell>{banner.content}</TableCell>
                    <TableCell>
                      {new Date(banner.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={banner?.isActive}
                          onChange={() => changeStatus(banner._id)}
                        />{" "}
                        <span className="slider round"></span>
                      </label>
                    </TableCell>
                    <TableCell>
                      <MdOutlineEdit
                        style={{
                          color: "blue",
                          fontSize: "20px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          navigate(`/admin/editVideoBanner/${banner._id}`)
                        }
                      />
                      <IoTrashOutline
                        onClick={() => deleteBanner(banner._id)}
                        style={{
                          color: "red",
                          fontSize: "18px",
                          cursor: "pointer",
                          marginLeft: "10px",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredBanners.length > 5 && (
            <TablePagination
              component="div"
              count={filteredBanners.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          )}
        </Paper>
      )}
    </Box>
  );
}
