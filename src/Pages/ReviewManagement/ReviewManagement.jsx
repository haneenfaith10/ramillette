import { useEffect, useState } from "react";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./ReviewManagement.css";
import {
  getAllReviewsForAdmin,
  updateReviewStatus,
} from "../../services/ratingApiServices";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  Modal,
  Box,
  Typography,
  Avatar,
  Rating,
  Chip,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { IoMdMore } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { makeTestimonial } from "../../services/testimonialApiServices";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "600px",
  bgcolor: "background.paper",
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  p: 0, // Padding handled inside content
  borderRadius: "20px",
  maxHeight: "90vh",
  overflowY: "auto",
  border: "none",
  outline: "none",
};

function ReviewModal({ open, handleCloseModal, modalData }) {
  if (!modalData || Object.keys(modalData).length === 0) return null;

  const { user, productId, content, rating, createdAt, countryId, status } =
    modalData;

  return (
    <Modal open={open} onClose={handleCloseModal} sx={{ backdropFilter: 'blur(8px)' }}>
      <Box sx={modalStyle}>
        <div style={{ padding: '20px' }}>
          <div className="admin-review-modal-header">
            <div>
              <Typography variant="h5" fontWeight="800" sx={{ color: '#1a1a1a' }}>Review Details</Typography>
              <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Order Summary & Feedback
              </Typography>
            </div>
            <IconButton onClick={handleCloseModal} sx={{ backgroundColor: '#f5f5f5', '&:hover': { backgroundColor: '#eee' } }}>
              <IoClose />
            </IconButton>
          </div>

          <div className="admin-review-modal-content">
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="review-user-info premium">
                <Avatar
                  src={`${import.meta.env.VITE_BASE_URL}/${user?.userImage}`}
                  alt={user?.firstName}
                  sx={{ width: 70, height: 70, border: '4px solid white', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#edc862', fontWeight: 'bold' }}>CUSTOMER</Typography>
                  <Typography variant="h6" fontWeight="700">{user?.firstName} {user?.lastName}</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>Verified Buyer</Typography>
                </Box>
              </div>

              <div className="review-product-info premium">
                <img
                  src={`${import.meta.env.VITE_BASE_URL}/${productId?.productImages?.[0]?.path || productId?.productImages?.[0]}`}
                  alt="Product"
                  className="review-modal-product-img"
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#edc862', fontWeight: 'bold' }}>PRODUCT</Typography>
                  <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1rem', lineHeight: '1.2' }}>{productId?.productName}</Typography>
                </Box>
              </div>
            </Box>

            <div className="review-meta-info">
              <div className="review-feedback-section">
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#333', fontWeight: '800', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ width: '4px', height: '16px', backgroundColor: '#edc862', borderRadius: '2px' }}></span>
                  CUSTOMER FEEDBACK
                </Typography>
                <div className="review-content-box premium">
                  <span style={{ fontSize: '2rem', color: '#edc862', lineHeight: '1', fontFamily: 'serif' }}>"</span>
                  {content}
                  <span style={{ fontSize: '2rem', color: '#edc862', lineHeight: '1', fontFamily: 'serif', marginLeft: '4px' }}>"</span>
                </div>
              </div>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mt: 3, p: '20px', backgroundColor: 'rgba(237, 200, 98, 0.05)', borderRadius: '15px' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#888', mb: 0.5, display: 'block' }}>RATING</Typography>
                  <Rating value={rating} precision={0.5} readOnly size="large" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#888', mb: 0.5, display: 'block' }}>PURCHASE ORIGIN</Typography>
                  {countryId && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5 }}>
                      <img src={`${import.meta.env.VITE_BASE_URL}${countryId.flagUrl}`} alt={countryId.name} style={{ width: "24px", height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                      <Typography variant="body1" fontWeight="600">{countryId.name}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mt: 4 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#888' }}>VISIBILITY:</Typography>
                  <Chip
                    label={status ? "PUBLIC" : "HIDDEN"}
                    sx={{
                      backgroundColor: status ? "#4caf50" : "#9e9e9e",
                      color: "white",
                      fontWeight: "900",
                      fontSize: '10px',
                      height: '24px',
                      letterSpacing: '1px'
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#aaa', fontStyle: 'italic' }}>
                  Posted on {new Date(createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [modalData, setModalData] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const adminToken = localStorage.getItem("remilletAdminTkn");
  const [changed, setChanged] = useState(false);

  const handleClick = (event, review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  useEffect(() => {
    getAllReviewsForAdmin(setReviews, adminToken);
  }, [adminToken, changed]);

  function updateStatus(reviewId, status) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to change review visibility?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#edc862",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await updateReviewStatus(reviewId, status);
        if (response) {
          setReviews(response);
          Swal.fire({
            title: "Updated!",
            text: "Visibility has been changed.",
            icon: "success",
          });
        }
      }
    });
  }

  async function moveToTestimonial(reviewId) {
    const response = await makeTestimonial(reviewId, adminToken);
    if (response) {
      setChanged((prev) => !prev);
    }
  }

  const filteredReviews = reviews.filter((review) =>
    review.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.productId?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="admin-review-management-container">
      <AdminHeader title="Reviews Overview" />

      <ReviewModal
        open={openModal}
        handleCloseModal={() => setOpenModal(false)}
        modalData={modalData}
      />

      <Box className="admin-banner-list-filters">
        <TextField
          label="Search by customer or product..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ backgroundColor: "white", borderRadius: "10px", minWidth: 350, "& fieldset": { borderRadius: "10px" } }}
        />
      </Box>

      <div className="admin-banner-list-section">
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center" style={{ width: '80px' }}>#</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Preview</TableCell>
                <TableCell align="center">Rating</TableCell>
                <TableCell align="center">Visibility</TableCell>
                <TableCell align="center">Featured</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="textSecondary">
                      No reviews matched your search.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review, index) => (
                  <TableRow hover key={review._id}>
                    <TableCell align="center">
                      <Typography variant="body2" color="textSecondary">{index + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          src={`${import.meta.env.VITE_BASE_URL}/${review.user?.userImage}`}
                          alt={review.user?.firstName}
                          sx={{ width: 32, height: 32 }}
                        />
                        <Typography variant="body2" fontWeight="600">{review.user?.firstName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <img
                          className="admin-review-management-product-image"
                          src={`${import.meta.env.VITE_BASE_URL}/${review.productId?.productImages?.[0]?.path || review.productId?.productImages?.[0]}`}
                          alt={review.productId?.productName}
                        />
                        <Tooltip title={review.productId?.productName || ""}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              maxWidth: 150,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {review.productId?.productName}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          maxWidth: 200,
                          fontStyle: 'italic',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        "{review.content}"
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Rating
                        size="small"
                        value={review.rating}
                        precision={0.5}
                        readOnly
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={review.status ? "Visible" : "Hidden"}
                        size="small"
                        sx={{
                          backgroundColor: review.status ? "rgba(76, 175, 80, 0.1)" : "rgba(0,0,0,0.05)",
                          color: review.status ? "#2e7d32" : "#666",
                          fontWeight: "bold"
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={review.isPromoted ? "Featured" : "No"}
                        size="small"
                        sx={{
                          backgroundColor: review.isPromoted ? "rgba(237, 200, 98, 0.15)" : "transparent",
                          color: review.isPromoted ? "#9c7c00" : "#999",
                          border: review.isPromoted ? "none" : "1px solid #ddd",
                          fontWeight: review.isPromoted ? "bold" : "normal"
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box className="review-actions-cell">
                        <Tooltip title="View Details">
                          <div
                            className="admin-banner-action-btn view-btn"
                            onClick={() => {
                              setModalData(review);
                              setOpenModal(true);
                            }}
                          >
                            <FaRegEye size={18} />
                          </div>
                        </Tooltip>
                        <Tooltip title="More Actions">
                          <div
                            className="admin-banner-action-btn more-btn"
                            onClick={(e) => handleClick(e, review)}
                          >
                            <IoMdMore size={20} />
                          </div>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: '12px',
            minWidth: 180,
            mt: 1,
            '& .MuiMenuItem-root': {
              fontSize: '14px',
              py: 1,
              px: 2,
              gap: 1.5,
              fontWeight: 500
            }
          }
        }}
      >
        <MenuItem onClick={() => {
          updateStatus(selectedReview._id, !selectedReview.status);
          setAnchorEl(null);
        }}>
          {selectedReview?.status ? "Hide Review" : "Show Review"}
        </MenuItem>

        {selectedReview?.status && (
          <MenuItem onClick={() => {
            moveToTestimonial(selectedReview._id);
            setAnchorEl(null);
          }}>
            {selectedReview?.isPromoted ? "Remove from Featured" : "Promote to Featured"}
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
