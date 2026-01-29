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
  Avatar,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import {
  deleteBestSeller,
  getAllBestSeller,
} from "../../services/bestSellerApiService";
import { IoClose } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./AdminBestSellerList.css";

export default function AdminBestSellerList() {
  const [bestSellerData, setBestSellerData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [openVideoModal, setOpenVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");

  const adminToken = localStorage.getItem("remilletAdminTkn");
  useEffect(() => {
    getAllBestSeller(setBestSellerData, adminToken);
  }, [adminToken]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenVideo = (videoPath) => {
    setSelectedVideo(`${import.meta.env.VITE_BASE_URL}/${videoPath}`);
    setOpenVideoModal(true);
  };

  const handleCloseVideo = () => {
    setOpenVideoModal(false);
    setSelectedVideo("");
  };

  function deleteTheBestSeller(bestSellerId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteBestSeller(bestSellerId);
        if (response) {
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
          });
          setBestSellerData(response);
        }
      }
    });
  }

  const filteredData = bestSellerData.filter((item) =>
    item.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <Box className="admin-best-seller-list-main-container">
      <AdminHeader title="Best Sellers" />

      {/* Filters & Actions Row */}
      <Box className="admin-banner-list-filters">
        <TextField
          label="Search by product name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ backgroundColor: "white", borderRadius: "10px", minWidth: 300, "& fieldset": { borderRadius: "10px" } }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <button
          className="admin-add-category-submit-btn-wrapper"
          style={{ width: "auto", margin: 0, border: "none" }}
          onClick={() => navigate("/admin/create-best-seller")}
        >
          <Box component="span" sx={{ px: 2, py: 1.2, backgroundColor: "#edc862", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: 1, color: "#333", boxShadow: "0 4px 12px rgba(237, 200, 98, 0.3)" }}>
            Add New Best Seller
          </Box>
        </button>
      </Box>

      <div className="admin-banner-list-section">
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Countries</TableCell>
                <TableCell align="center">Discount</TableCell>
                <TableCell align="center">Rating</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Video</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="textSecondary">
                      No best seller data available.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow hover key={item._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={`${import.meta.env.VITE_BASE_URL}/${item.product?.productImages?.[0]}`}
                            alt={item.product?.productName}
                            variant="rounded"
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: "10px",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                              border: "1px solid rgba(0,0,0,0.05)"
                            }}
                          />
                          <Tooltip title={item.product?.productName || ""}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: "#444",
                                maxWidth: 200,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                            >
                              {item.product?.productName}
                            </Typography>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {item.country?.map((c) => (
                            <Chip
                              key={c._id}
                              label={c.name}
                              avatar={<Avatar src={c.flagUrl} alt={c.name} />}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(237, 200, 98, 0.1)",
                                fontWeight: 500,
                                borderRadius: "6px",
                                border: "none"
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${item.product?.productDiscount || 0}%`}
                          size="small"
                          sx={{ backgroundColor: "#ffefef", color: "#d32f2f", fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.product?.productRating || 0}</Typography>
                          <Typography variant="caption" sx={{ color: "#edc862" }}>★</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 500, color: (item.product?.productStock || 0) < 10 ? "#d32f2f" : "#666" }}>
                          {item.product?.productStock || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <button
                          className="view-video-btn"
                          onClick={() => handleOpenVideo(item.video)}
                        >
                          View Video
                        </button>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                          <div
                            className="admin-banner-action-btn edit-btn"
                            onClick={() => navigate(`/admin/edit-best-seller/${item._id}`)}
                          >
                            <MdOutlineEdit size={20} color="white" />
                          </div>
                          <div
                            className="admin-banner-action-btn delete-btn"
                            onClick={() => deleteTheBestSeller(item._id)}
                          >
                            <IoTrashOutline size={20} color="white" />
                          </div>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
        />
      </div>

      <Dialog open={openVideoModal} onClose={handleCloseVideo} maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Product Video
          <IconButton onClick={handleCloseVideo}>
            <IoClose />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedVideo && (
            <video width="100%" height="auto" controls autoPlay>
              <source src={selectedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
