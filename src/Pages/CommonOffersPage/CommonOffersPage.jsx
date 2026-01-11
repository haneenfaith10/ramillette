import { useEffect, useState } from "react";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import OfferSection from "../../Components/OfferSection/OfferSection";
import { deleteOffer, fetchCommonOffers } from "../../services/offerApiService";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
} from "@mui/material";
import { IoTrashOutline } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import Swal from "sweetalert2";

export default function CommonOffersPage() {
  const [offers, setOffers] = useState([]);
  const [changed, setChanged] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    const offerInLocal = localStorage.getItem("unsavedOffers");
    if (offerInLocal) {
      localStorage.removeItem("unsavedOffers");
    }
  }, [changed]);

  useEffect(() => {
    fetchCommonOffers(setOffers,adminToken);
  }, [changed,adminToken]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this offer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      const res = await deleteOffer(id);
      if (res?.isSuccess) {
        Swal.fire("Deleted!", "Offer has been deleted.", "success");
        setChanged((prev) => !prev);
      }
    }
  };

  const handleEdit = (offer) => {
    setInitialValues(offer);
  };

  function clearEdit() {
    setInitialValues({});
  }

  return (
    <div className="admin-common-offers-page-container">
      <AdminHeader title="Common Offers" />
      <OfferSection
        setOffers={setOffers}
        setChanged={setChanged}
        isCommon={true}
        initialValues={initialValues}
        clearEdit={clearEdit}
      />

      <div style={{ margin: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", fontWeight: 500 }}>Offers List</h3>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="offers table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Sl No.</TableCell>
                <TableCell align="center">Title</TableCell>
                <TableCell align="center">Type</TableCell>
                <TableCell align="center">Discount (% or flat)</TableCell>
                <TableCell align="center">Valid From</TableCell>
                <TableCell align="center">Valid To</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {offers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((offer, index) => (
                  <TableRow key={offer._id}>
                    <TableCell align="center">
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell align="center">{offer.title}</TableCell>
                    <TableCell align="center">{offer.type}</TableCell>
                    <TableCell align="center">
                      {`${offer.discountValue} ${
                        offer.discountType === "flat" ? "flat" : "%"
                      }`}
                    </TableCell>
                    <TableCell align="center">
                      {offer.validFrom
                        ? new Date(offer.validFrom).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {offer.validTo
                        ? new Date(offer.validTo).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {offer.isActive ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip arrow title="Edit">
                        <IconButton onClick={() => handleEdit(offer)}>
                          <MdOutlineEdit color="blue" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title="Delete">
                        <IconButton onClick={() => handleDelete(offer._id)}>
                          <IoTrashOutline color="red" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {offers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No offers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {offers.length > 10 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={offers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </div>
    </div>
  );
}
