import { useEffect, useState } from "react";
import "./AdminProductPreview.css";
import { useParams } from "react-router-dom";
// import { getSingleProduct } from "../../services/productApiServices";
import { getSingleProductDetails } from "../../services/adminApiServices";

export default function AdminProductPreview() {
  const productId = useParams().id;
  const [product, setProduct] = useState({});

  useEffect(() => {
    if (productId) {
      // getSingleProduct(productId, setProduct);
      getSingleProductDetails(productId, setProduct);
    }
  }, [productId]);

  if (!product || !product.productName) return <p>Loading...</p>;

  return (
    <div className="app-container">
      <header className="header-section">
        <h1 className="product-name">{product.productName}</h1>
        <div className="key-info">
          <span className="rating">⭐ {product.productRating} / 5</span>
          <span className="stock">Stock: {product.productStock}</span>
          <span className="discount">Discount: {product.productDiscount}%</span>
          <span className={`status ${product.status ? "active" : "inactive"}`}>
            {product.status ? "Active" : "Inactive"}
          </span>
        </div>
      </header>

      <section className="main-section">
        <div className="left-column">
          <div className="info-card">
            <h2>General Info</h2>
            <p>
              <strong>Short Name:</strong> {product.productShortName}
            </p>
            <p>
              <strong>Description:</strong> {product.productDescription}
            </p>
            <p>
              <strong>Categories:</strong>
            </p>
            <div className="category-container">
              {product?.productCategory?.length > 0 ? (
                product.productCategory.map((category) => (
                  <div className="category-box" key={category._id}>
                    <img
                      src={`${
                        import.meta.env.VITE_BASE_URL
                      }/${category.categoryImage.replace(/\\/g, "/")}`}
                      alt={category.categoryName}
                      className="category-image"
                    />
                    <span className="category-name">
                      {category.categoryName}
                    </span>
                  </div>
                ))
              ) : (
                <span className="category-fallback">N/A</span>
              )}
            </div>
            <p>
              <strong>Ingredients:</strong> {product.productIngredients}
            </p>
            <p>
              <strong>Other Info:</strong> {product.productOtherInfo || "N/A"}
            </p>
          </div>

          <div className="info-card">
            <h2>Benefits</h2>
            <ul>
              {product.productBenefits?.map((benefit, i) => (
                <li key={i}>{benefit}</li>
              ))}
            </ul>
          </div>

          <div className="info-card">
            <h2>Use Cases</h2>
            <ul>
              {product.productUseCase?.map((useCase, i) => (
                <li key={i}>{useCase}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="right-column">
          <div className="image-gallery">
            {product.productImages?.map((img, idx) => (
              <img
                key={idx}
                src={`${import.meta.env.VITE_BASE_URL}/${img.path}`}
                alt={`Product image ${idx + 1}`}
              />
            ))}
          </div>

          <div className="info-card faq-section">
            <h2>FAQs</h2>
            {product.productFAQ?.length ? (
              product.productFAQ.map(({ question, answer }, idx) => (
                <div key={idx} className="faq-item">
                  <p>
                    <strong>Q:</strong> {question}
                  </p>
                  <p>
                    <strong>A:</strong> {answer}
                  </p>
                </div>
              ))
            ) : (
              <p>No FAQs available.</p>
            )}
          </div>

          <div className="info-card countries-prices">
            <h2>Countries & Prices</h2>
            <ul>
              {product.countries && product.countryPrices ? (
                product.countries.map((country, idx) => {
                  const priceObj = product.countryPrices.find(
                    (cp) => cp.country._id === country
                  );
                  return (
                    <li key={idx}>
                      <strong>Country:</strong> {country.name} —{" "}
                      <strong>Price:</strong>{" "}
                      {priceObj ? priceObj.price : "N/A"}{" "}
                      <strong>({priceObj?.country?.currency ?? ""})</strong>
                    </li>
                  );
                })
              ) : (
                <li>No countries/prices data</li>
              )}
            </ul>
          </div>
        </aside>
      </section>

      <footer className="footer-section">
        <p>
          <strong>Deleted:</strong> {product.isDelete ? "Yes" : "No"}
        </p>
        <p className="timestamps">
          Created: {new Date(product.createdAt).toLocaleString()} <br />
          Updated: {new Date(product.updatedAt).toLocaleString()}
        </p>
      </footer>
    </div>
  );
}
