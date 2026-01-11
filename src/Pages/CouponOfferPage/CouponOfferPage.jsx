import { useEffect, useState } from "react";
import CouponOffer from "../../Components/CouponOffer/CouponOffer";
import "./CouponOfferPage.css";
import {
  deleteCouponOffer,
  getCouponOffers,
  toggleCouponOffer,
} from "../../services/offerApiService";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  TextField,
  MenuItem,
  TableSortLabel,
  IconButton,
  Tooltip,
  TablePagination,
} from "@mui/material";
import { MdOutlineEdit } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import Swal from "sweetalert2";

export default function CouponOfferPage() {
  const [showForm, setShowForm] = useState(false);
  const [offers, setOffers] = useState([]);
  const adminToken = localStorage.getItem("remilletAdminTkn");
  const [changed, setChanged] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    getCouponOffers(adminToken, setOffers);
  }, [changed]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredOffers = offers
    .filter((offer) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        offer.title?.toLowerCase().includes(term) ||
        offer.badge?.toLowerCase().includes(term) ||
        offer.couponCode?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? offer.isActive
          : !offer.isActive;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === "string")
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      if (typeof aVal === "number" || aVal instanceof Date)
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      return 0;
    });

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  // to change the status of the offer
  async function handleToggleStatus(offerId) {
    const response = await toggleCouponOffer(offerId, adminToken);
    if (response) {
      setChanged((prev) => !prev);
    }
  }

  async function handleDelete(offerId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this offer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteCouponOffer(offerId, adminToken);
        if (response) {
          setChanged((prev) => !prev);
          Swal.fire({
            title: "Deleted!",
            text: "This offer has been deleted.",
            icon: "success",
          });
        }
      }
    });
  }

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated offers
  const paginatedOffers = filteredOffers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="coupon-offer-page-container">
      <CouponOffer
        setShowForm={setShowForm}
        showForm={showForm}
        editData={editData}
        setChanged={setChanged}
        setEditData={setEditData}
        cancelEdit={() => setEditData(null)}
      />
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Coupon Offers
        </Typography>
        {/* Search and Filter Controls */}
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <TextField
            label="Status"
            select
            variant="outlined"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  { label: "Title", key: "title" },
                  { label: "Badge", key: "badge" },
                  { label: "Coupon Code", key: "couponCode" },
                  { label: "Discount", key: "discountValue" },
                  { label: "Min Order", key: "minOrderValue" },
                  { label: "Max Order", key: "maxPurchase" },
                  { label: "Usage Limit", key: "couponCount" },
                  { label: "Used", key: "usedCount" },
                  { label: "From", key: "validFrom" },
                  { label: "To", key: "validTo" },
                  { label: "Status", key: "isActive" },
                  { label: "Actions", key: "Actions" },
                ].map((col) => (
                  <TableCell key={col.key}>
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortOrder : "asc"}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOffers.map((offer) => (
                <TableRow key={offer._id}>
                  <TableCell>{offer.title}</TableCell>
                  <TableCell>{offer.badge}</TableCell>
                  <TableCell>{offer.couponCode}</TableCell>
                  <TableCell>
                    {offer.discountValue}{" "}
                    {offer.discountType === "percent" ? "%" : "₹"}
                  </TableCell>
                  <TableCell>{offer.minOrderValue}</TableCell>
                  <TableCell>{offer.minOrderValue}</TableCell>
                  <TableCell>{offer.usageLimit}</TableCell>
                  <TableCell>{offer.usedCount}</TableCell>
                  <TableCell>
                    {new Date(offer.validFrom).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(offer.validTo).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={offer.isActive ? "Active" : "Inactive"}
                      color={offer.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Toggle Status">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={offer.isActive}
                          onChange={() => handleToggleStatus(offer._id)}
                        />{" "}
                        <span className="slider round"></span>
                      </label>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => {
                          setEditData(offer);
                          setShowForm(true);
                        }}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <MdOutlineEdit size={18} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(offer._id)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <IoTrashOutline size={18} color="red" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {offers.length > 10 && (
            <TablePagination
              component="div"
              count={filteredOffers.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          )}
        </TableContainer>
      </Box>
    </div>
  );
}
