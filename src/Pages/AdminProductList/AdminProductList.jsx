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
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  createTheme,
  ThemeProvider,
} from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#c9a227",
      contrastText: "#fff",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c9a227",
          },
        },
      },
    },
  },
});

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
    <ThemeProvider theme={theme}>
      <Box className="admin-product-list-main-container">
        <AdminHeader title="Product List" />

        <Paper elevation={0} className="admin-product-list-filters">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2
            }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, flex: 1 }}>
              <TextField
                placeholder="Search products..."
                variant="outlined"
                size="small"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  endAdornment: searchText && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSearchText("");
                          setDebouncedSearch("");
                          setPage(0);
                        }}
                      >
                        <IoClose />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={countryFilter}
                  label="Country"
                  onChange={(e) => {
                    setCountryFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Countries</MenuItem>
                  {countries?.map((country, index) => (
                    <MenuItem key={index} value={country.name}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By Price</InputLabel>
                <Select
                  value={priceSort}
                  label="Sort By Price"
                  onChange={(e) => {
                    setPriceSort(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="lowToHigh">Low to High</MenuItem>
                  <MenuItem value="highToLow">High to Low</MenuItem>
                </Select>
              </FormControl>

              {(searchText || statusFilter || countryFilter || priceSort) && (
                <Button
                  variant="text"
                  color="error"
                  className="admin-product-list-clear-btn"
                  onClick={() => {
                    setSearchText("");
                    setDebouncedSearch("");
                    setStatusFilter("");
                    setCountryFilter("");
                    setPriceSort("");
                    setPage(0);
                  }}
                  startIcon={<IoClose />}
                >
                  Clear All
                </Button>
              )}
            </Box>

            <Button
              variant="contained"
              className="admin-product-list-add-btn"
              onClick={() => navigate("/admin/add-new-product")}
            >
              Create Product
            </Button>
          </Box>
        </Paper>

        {products.length > 0 ? (
          <Paper elevation={0} className="admin-product-list-table-card">
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Sl No.</TableCell>
                    <TableCell>Product Name</TableCell>
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
                    <TableRow
                      key={product._id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" className="admin-product-list-product-name">
                          {product.productName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={0.5}>
                          {product.countries?.map((country, idx) => (
                            <Chip
                              key={idx}
                              label={country.name}
                              avatar={<Avatar src={country.flagUrl} alt={country.name} />}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${product.productDiscount}%`}
                          size="small"
                          className="admin-product-list-discount-chip"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Avatar
                          src={`${import.meta.env.VITE_BASE_URL}/${product.productImages?.[0]?.path || product.productImages?.[0]}`}
                          variant="rounded"
                          sx={{ width: 45, height: 45, mx: 'auto', border: '1px solid #eee' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }} className="admin-product-list-rating">
                          <Typography variant="body2">
                            {product.productRating}
                          </Typography>
                          <MdStarRate color="#f59e0b" size={18} />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={product.status ? "Active" : "Inactive"}
                          color={product.status ? "success" : "error"}
                          size="small"
                          onClick={() => changeStatus(product._id)}
                          sx={{
                            width: 80,
                            fontWeight: 500,
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            className="admin-product-list-action-btn"
                            onClick={() => navigate(`/admin/product-preview/${product._id}`)}
                            title="View"
                          >
                            <FaRegEye size={18} />
                          </IconButton>
                          <IconButton
                            size="small"
                            className="admin-product-list-action-btn"
                            component={Link}
                            to={`/admin/edit-product/${product._id}`}
                            state={{ product }}
                            title="Edit"
                          >
                            <MdOutlineEdit size={18} />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteProductItem(product._id)}
                            title="Delete"
                          >
                            <IoTrashOutline size={18} />
                          </IconButton>
                        </Box>
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
            />
          </Paper>
        ) : (
          <Paper variant="outlined" className="admin-product-list-empty">
            <Typography color="textSecondary">No product available</Typography>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
}
