import { useEffect, useState } from "react";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./ReviewManagement.css";
import {
  getAllReviewsForAdmin,
  updateReviewStatus,
} from "../../services/ratingApiServices";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
// import Rating from "@mui/material/Rating";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IoMdMore } from "react-icons/io";
import Swal from "sweetalert2";
import { Modal, Box, Typography, Avatar, Rating, Chip } from "@mui/material";
import { FaRegEye } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { makeTestimonial } from "../../services/testimonialApiServices";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "60%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  borderRadius: "8px",
  maxHeight: "90vh",
  overflowY: "auto",
};

function ReviewModal({ open, handleCloseModal, modalData }) {
  if (Object.keys(modalData).length === 0) return null;

  const { user, productId, content, rating, createdAt, countryId, status } =
    modalData;

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <div className="admin-review-modal-header">
          <Typography variant="h6">Review Details</Typography>
          <IoClose onClick={handleCloseModal} style={{ cursor: "pointer" }} />
        </div>

        <div className="admin-review-modal-content">
          <div className="review-user-info">
            <Avatar
              src={`${import.meta.env.VITE_BASE_URL}/${user.userImage}`}
              alt={user.firstName}
              sx={{ width: 50, height: 50 }}
            />
            <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
              <Typography>{user?.firstName}</Typography>
              <Typography>{user?.lastName}</Typography>
            </Box>
          </div>

          <div className="review-product-info">
            <img
              src={`${import.meta.env.VITE_BASE_URL}/${
                productId && productId?.productImages?.[0]
              }`}
              alt="Product"
              className="review-modal-product-img"
            />
            <Typography fontWeight="bold">
              {productId && productId?.productName}
            </Typography>
          </div>

          <div className="review-meta-info">
            <Typography variant="body1" gutterBottom>
              <strong>Review:</strong> {content}
            </Typography>
            <Typography sx={{ display: "flex", gap: "5px" }}>
              <strong>Rating:</strong>{" "}
              <Rating
                name="read-only"
                value={rating}
                precision={0.5}
                readOnly
              />
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Country:</strong>{" "}
              {countryId && (
                <>
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}${countryId.flagUrl}`}
                    alt={countryId.name}
                    style={{
                      width: "20px",
                      aspectRatio: 1 / 1,
                      marginRight: "6px",
                      verticalAlign: "middle",
                    }}
                  />
                  {countryId.name}
                </>
              )}
            </Typography>
            <div style={{ marginTop: "15px" }}>
              <Typography variant="subtitle2" gutterBottom>
                <strong>Status:</strong>
              </Typography>
              <Chip
                label={status ? "Visible" : "Hidden"}
                color={status ? "success" : "default"}
                variant="outlined"
                size="small"
              />
            </div>
            <Typography variant="body2">
              <strong>Submitted on:</strong>{" "}
              {new Date(createdAt).toLocaleString()}
            </Typography>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [modalData, setModalData] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const handleModalOpen = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
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
      text: "You change the review visibility?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await updateReviewStatus(reviewId, status);
        if (response) {
          setReviews(response);
          Swal.fire({
            title: "Changed!",
            text: "The review visibility has been changed.",
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

  return (
    <section className="admin-review-management-container">
      <AdminHeader title="Reviews" />
      <ReviewModal
        open={openModal}
        handleCloseModal={handleCloseModal}
        modalData={modalData}
      />
      <div>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Sl No.</TableCell>
                <TableCell align="center">Customer</TableCell>
                <TableCell align="center">Product</TableCell>
                <TableCell align="center">Review</TableCell>
                <TableCell align="center">Rating</TableCell>
                <TableCell align="center">Visibility</TableCell>
                <TableCell align="center">In Testimonial</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{review.user.firstName}</TableCell>
                  <TableCell align="center">
                    <img
                      className="admin-review-management-product-image"
                      src={`${import.meta.env.VITE_BASE_URL}/${
                        review.productId
                          ? review.productId.productImages[0].path
                          : ""
                      }`}
                      alt=""
                    />
                    <p>{review.productId && review.productId.productName}</p>
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 200,
                    }}
                    align="center"
                  >
                    {review.content}
                  </TableCell>
                  <TableCell align="center">
                    <Rating
                      size="small"
                      name="half-rating-read"
                      value={review.rating}
                      precision={0.5}
                      readOnly
                    />
                  </TableCell>
                  <TableCell align="center">
                    {review.status ? "Visible" : "Hidden"}
                  </TableCell>
                  <TableCell align="center">
                    {review.isPromoted ? "Yes" : "No"}
                  </TableCell>
                  <TableCell align="center">
                    <FaRegEye
                      size={18}
                      style={{ marginRight: "10px", cursor: "pointer" }}
                      onClick={() => {
                        setModalData(review);
                        handleModalOpen();
                      }}
                    />
                    <IoMdMore
                      style={{ cursor: "pointer" }}
                      onClick={(e) => handleClick(e, review)}
                      size={20}
                    />
                    <Menu
                      id={`review-menu-[${selectedReview?._id}]`}
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => {
                        setAnchorEl(null);
                        setSelectedReview(null);
                      }}
                      PaperProps={{
                        elevation: 2,
                        sx: {
                          boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                          "& .MuiMenuItem-root": {
                            fontSize: "0.85rem",
                          },
                          minWidth: "5rem",
                        },
                      }}
                    >
                      {selectedReview?.status ? (
                        <MenuItem
                          onClick={() => {
                            updateStatus(selectedReview._id, false);
                            setAnchorEl(null);
                            setSelectedReview(null);
                          }}
                        >
                          Hide
                        </MenuItem>
                      ) : (
                        <MenuItem
                          onClick={() => {
                            updateStatus(selectedReview._id, true);
                            setAnchorEl(null);
                            setSelectedReview(null);
                          }}
                        >
                          Show
                        </MenuItem>
                      )}
                      {selectedReview?.status && (
                        <MenuItem
                          onClick={() => {
                            moveToTestimonial(selectedReview._id);
                            setAnchorEl(null);
                            setSelectedReview(null);
                          }}
                        >
                          {selectedReview?.isPromoted
                            ? "Remove from Testimonial"
                            : " Promote to Testimonial"}
                        </MenuItem>
                      )}
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </section>
  );
}
