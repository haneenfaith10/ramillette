import "./AdminProductPreviewModal.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { IoClose } from "react-icons/io5";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  borderRadius: "12px",
};

export default function AdminProductPreviewModal(Props) {
  const { open = false, handleClose = () => {}, data = {} } = Props;

  const product = data;

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="admin-product-preview-modal">
          <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
            <h1>{product.productName}</h1>
            <p>
              <strong>Short Name:</strong> {product.productShortName}
            </p>
            <p>
              <strong>Description:</strong> {product.productDescription}
            </p>

            <h3>Category:</h3>
            <p>{product.productCategory || "No category assigned"}</p>

            <h3>Benefits:</h3>
            <ul>
              {product.productBenefits?.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>

            <h3>Use Cases:</h3>
            <ul>
              {product.productUseCase?.map((useCase, idx) => (
                <li key={idx}>{useCase}</li>
              ))}
            </ul>

            <p>
              <strong>Ingredients:</strong> {product.productIngredients}
            </p>
            <p>
              <strong>Other Info:</strong> {product.productOtherInfo || "N/A"}
            </p>

            <p>
              <strong>Discount:</strong> {product.productDiscount}%
            </p>
            <p>
              <strong>Stock:</strong> {product.productStock}
            </p>
            <p>
              <strong>Rating:</strong> {product.productRating} / 5
            </p>

            <h3>Images:</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {product.productImages?.map((img, idx) => (
                <img
                  key={idx}
                  src={`${import.meta.env.VITE_BASE_URL}/${img}`}
                  alt={`Product image ${idx + 1}`}
                  style={{
                    width: 150,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>

            <h3>FAQs:</h3>
            <ul>
              {product.productFAQ?.map(({ question, answer }, idx) => (
                <li key={idx}>
                  <strong>Q:</strong> {question} <br />
                  <strong>A:</strong> {answer}
                </li>
              ))}
            </ul>

            <h3>Countries & Prices:</h3>
            <ul>
              {product.countries && product.countryPrices ? (
                product.countries.map((countryId, idx) => {
                  const priceObj = product.countryPrices.find(
                    (cp) => cp.country.toString() === countryId.toString()
                  );
                  return (
                    <li key={idx}>
                      <strong>Country ID:</strong> {countryId} -{" "}
                      <strong>Price:</strong>{" "}
                      {priceObj ? priceObj.price : "N/A"}
                    </li>
                  );
                })
              ) : (
                <li>No countries/prices data</li>
              )}
            </ul>

            <p>
              <strong>Status:</strong> {product.status ? "Active" : "Inactive"}
            </p>
            <p>
              <strong>Deleted:</strong> {product.isDelete ? "Yes" : "No"}
            </p>

            <p>
              <small>
                Created At: {new Date(product.createdAt).toLocaleString()}{" "}
                <br />
                Updated At: {new Date(product.updatedAt).toLocaleString()}
              </small>
            </p>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
