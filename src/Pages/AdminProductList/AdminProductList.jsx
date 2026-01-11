import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AdminProductList.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Swal from "sweetalert2";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { useEffect, useState } from "react";
import {
  changeProductStatus,
  deleteProduct,
  getAllProducts,
} from "../../services/productApiServices";
import { FaRegEye } from "react-icons/fa";
import { MdOutlineEdit, MdStarRate } from "react-icons/md";
import { IoTrashOutline, IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { getActiveCountries } from "../../services/configApiService";
import { Avatar, Box, Button, Chip } from "@mui/material";

export default function AdminProductList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [changed, setChanged] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const adminCountry = localStorage.getItem("RemilletteAdminCountry");
  const [countries, setCountries] = useState([]);
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  useEffect(() => {
    (async () => {
      const response = await getActiveCountries();
      if (response) {
        setCountries(response);
      }
    })();
  }, []);

  useEffect(() => {
    getAllProducts(
      page + 1,
      rowsPerPage,
      debouncedSearch,
      (data) => {
        let filtered = [...data];

        if (statusFilter) {
          filtered = filtered.filter((product) =>
            statusFilter === "active" ? product.status : !product.status
          );
        }

        if (countryFilter) {
          filtered = filtered.filter((product) =>
            product.countries?.some((c) => c.name === countryFilter)
          );
        }

        if (priceSort === "lowToHigh" || priceSort === "highToLow") {
          filtered.sort((a, b) => {
            const aPrice =
              a.countryPrices.find(
                (item) => item.country?.name === adminCountry
              )?.price ??
              a.countryPrices?.[0]?.price ??
              0;
            const bPrice =
              b.countryPrices.find(
                (item) => item.country?.name === adminCountry
              )?.price ??
              b.countryPrices?.[0]?.price ??
              0;
            return priceSort === "lowToHigh"
              ? aPrice - bPrice
              : bPrice - aPrice;
          });
        }

        setProducts(filtered);
      },
      setTotalProducts,
      adminToken
    );
  }, [
    changed,
    page,
    rowsPerPage,
    debouncedSearch,
    statusFilter,
    countryFilter,
    priceSort,
    adminCountry,
    adminToken,
  ]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  function deleteProductItem(id) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete the product!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteProduct(id, setChanged);
        if (response) {
          Swal.fire("Deleted!", "Product deleted.", "success");
        }
      }
    });
  }

  function changeStatus(id) {
    Swal.fire({
      title: "Are you sure?",
      text: "Change product status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await changeProductStatus(id, setChanged);
        if (response) {
          Swal.fire("Changed!", "Status updated.", "success");
        }
      }
    });
  }

  return (
    <div className="admin-product-list-main-container">
      <div className="admin-product-list-container">
        <AdminHeader title="Product List" />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="admin-product-list-controls">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search products..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(0);
                }}
              />
              {searchText && (
                <IoClose
                  // className="admin-product-list-search-clear"
                  onClick={() => {
                    setSearchText("");
                    setDebouncedSearch("");
                    setPage(0);
                  }}
                  style={{ cursor: "pointer" }}
                />
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Countries</option>
              {countries &&
                countries.length > 0 &&
                countries.map((country, index) => (
                  <option key={index} value={country.name}>
                    {country.name}
                  </option>
                ))}
            </select>
            <select
              value={priceSort}
              onChange={(e) => {
                setPriceSort(e.target.value);
                setPage(0);
              }}
            >
              <option value="">Price Sort</option>
              <option value="lowToHigh">Low to High</option>
              <option value="highToLow">High to Low</option>
            </select>
            {searchText && (
              <IoClose
                className="admin-product-list-search-clear"
                onClick={() => {
                  setSearchText("");
                  setDebouncedSearch("");
                  setPage(0);
                }}
              />
            )}
            <button
              className="admin-product-list-clear-btn"
              onClick={() => {
                setSearchText("");
                setDebouncedSearch("");
                setStatusFilter("");
                setCountryFilter("");
                // setMinPriceFilter("");
                // setMaxPriceFilter("");
                setPage(0);
              }}
              // style={{
              //   padding: "6px 12px",
              //   backgroundColor: "#e53935",
              //   color: "#fff",
              //   border: "none",
              //   borderRadius: "4px",
              //   cursor: "pointer",
              // }}
            >
              Clear Filter
            </button>
          </div>
          <Button
            type="primary"
            variant="contained"
            onClick={() => navigate("/admin/add-new-product")}
            sx={{ backgroundColor: "var(--secondary-color)" }}
          >
            Create Product
          </Button>
        </Box>

        {products.length > 0 ? (
          <div>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sl No.</TableCell>
                    <TableCell align="center">Name</TableCell>
                    <TableCell align="center">Countries</TableCell>

                    <TableCell align="center">Discount</TableCell>
                    <TableCell align="center">Image</TableCell>
                    <TableCell align="center">Rating</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow key={product._id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell align="center">
                        {product.productName}
                      </TableCell>
                      <TableCell align="center">
                        {/* {(() => {
                          const matched = product.countryPrices.find(
                            (item) => item.country?.name === adminCountry
                          );
                          const fallback = product.countryPrices?.[0];
                          const price =
                            matched?.price ?? fallback?.price ?? "N/A";
                          const currency =
                            matched?.country?.currency ??
                            fallback?.country?.currency ??
                            "";
                          return `${price} ${currency}`;
                        })()} */}
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {product &&
                            product.countries &&
                            product.countries.length > 0 &&
                            product.countries.map((country, index) => (
                              <Chip
                                key={index}
                                label={country.name}
                                avatar={
                                  <Avatar
                                    src={country.flagUrl}
                                    alt={country.name}
                                  />
                                }
                                size="small"
                              />
                            ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {product.productDiscount}%
                      </TableCell>
                      <TableCell align="center">
                        <img
                          src={`${import.meta.env.VITE_BASE_URL}/${
                            product.productImages?.[0].path ||
                            product.productImages?.[0]
                          }`}
                          alt="product"
                          className="admin-product-list-image"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {product.productRating}
                        <MdStarRate color="gold" />
                      </TableCell>
                      <TableCell align="center">
                        <button
                          onClick={() => changeStatus(product._id)}
                          className={
                            product.status
                              ? "product-active-btn"
                              : "product-inactive-btn"
                          }
                        >
                          {product.status ? "Active" : "Inactive"}
                        </button>
                      </TableCell>
                      <TableCell align="center">
                        <div className="admin-product-list-action-icons-container">
                          <FaRegEye
                            size={18}
                            onClick={() =>
                              navigate(`/admin/product-preview/${product._id}`)
                            }
                          />
                          <Link
                            to={`/admin/edit-product/${product._id}`}
                            state={{ product }}
                          >
                            <MdOutlineEdit size={16} color="blue" />
                          </Link>
                          <IoTrashOutline
                            color="red"
                            size={16}
                            onClick={() => deleteProductItem(product._id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalProducts}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ border: ".5px solid #ccc", borderRadius: "0 0 8px 8px" }}
            />
          </div>
        ) : (
          <div className="product-empty-container">
            <p>No product available</p>
          </div>
        )}
      </div>
    </div>
  );
}
