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
  Button,
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
    getAllBestSeller(setBestSellerData,adminToken);
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
      text: "You won't to delete !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
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
    <Box className="admin-best-seller-list-main-container" p={2}>
      <AdminHeader title="Best Seller" />

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "2px 8px", borderRadius: "4px", border: "1px solid #ccc", width: "250px" }}
        />
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "var(--secondary-color)" }}
            onClick={() => navigate("/admin/create-best-seller")}
          >
            Create
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Countries</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Video</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No Best Seller data available.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow hover key={item._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            src={`${import.meta.env.VITE_BASE_URL}/${item.product?.productImages?.[0]}`}
                            alt={item.product?.productName}
                            sx={{ mr: 1 }}
                            variant="rounded"
                          />
                          <Typography variant="body1">
                            {item.product?.productName}
                          </Typography>
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
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{item.product?.productDiscount}%</TableCell>
                      <TableCell>{item.product?.productRating || 0}</TableCell>
                      <TableCell>{item.product?.productStock}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ cursor: "pointer", textDecoration: "underline" }}
                          onClick={() => handleOpenVideo(item.video)}
                        >
                          View Video
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <MdOutlineEdit
                          size={18}
                          style={{ cursor: "pointer", marginRight: "1rem" }}
                          onClick={() => navigate(`/admin/edit-best-seller/${item._id}`)}
                        />
                        <IoTrashOutline
                          size={18}
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => deleteTheBestSeller(item._id)}
                        />
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
        />
      </Paper>

      <Dialog open={openVideoModal} onClose={handleCloseVideo} maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Product Video
          <IconButton onClick={handleCloseVideo}>
            <IoClose />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedVideo && (
            <video width="100%" height="auto" controls>
              <source src={selectedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
