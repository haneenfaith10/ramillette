import { useEffect, useState } from "react";
import TopHeader from "../../Components/TopHeader/TopHeader";
import NavBar from "../../Components/NavBar/NavBar";
import ProductInnerproduct from "../../Components/ProductInner/ProductInner";
import Footer from "../../Components/Footer/Footer";
import { useParams } from "react-router-dom";
import "./ProductInnerPage.css";
import {
  getRelatedProduct,
  getSingleProduct,
} from "../../services/productApiServices";
import { useSelector } from "react-redux";
import { getProductReviews } from "../../services/ratingApiServices";
import RelatedProducts from "../../Components/RelatedProducts/RelatedProducts";
import reviewauthor from "../../assets/images/userAvathar.jpg";
import Rating from "@mui/material/Rating";

export default function ProductInner() {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [changed, setChanged] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const userId = useSelector((state) => state.user.user?.id);
  const [userReviews, setUserReviews] = useState({});

  useEffect(() => {
    if (id && selectedCountry?._id) {
      getSingleProduct(id, setProduct, selectedCountry._id);
    }
  }, [id, selectedCountry?._id]);

  useEffect(() => {
    if (product._id && selectedCountry._id) {
      getProductReviews(product._id, selectedCountry._id, userId, setReviews);
    }
  }, [product._id, selectedCountry._id, changed, userId]);

  useEffect(() => {
    if (product._id) {
      getRelatedProduct(product._id, setRelatedProducts, selectedCountry._id);
    }
  }, [product._id, selectedCountry._id]);

  useEffect(() => {
    const userReviews = reviews.find((review) => review.user._id === userId);
    setUserReviews(userReviews);
  }, [reviews, userId]);

  return (
    <>
      <div className="product-inner-page">
        <TopHeader />
        <NavBar />
        <div className="container">
          <div className="product-inner-wrap">
            <div className="">
              <div className="product-inner-sec">
                <ProductInnerproduct
                  product={product}
                  setChanged={setChanged}
                  userReviews={userReviews}
                  reviews={reviews}
                />
              </div>
            </div>
          </div>
          {/* <div className="testimonial-sec">
          <div className="wrapper">
            <Testimonial reviews={reviews} />
          </div>
        </div> */}
          {reviews && reviews.length > 0 && (
            <div className="review-content">
              <div className="wrapper">
                <div className="review-content-wrapp-sec">
                  <div className="review-content-header">
                    <h2>Reviews</h2>
                  </div>
                  <div className="review-content-wrapper">
                    {reviews && reviews.length > 0 && (
                      <>
                        {(showAllReviews ? reviews : reviews.slice(0, 3)).map(
                          (review, index) => (
                            <div key={index}>
                              <div className="review-header">
                                <div className="author-profile">
                                  <div className="author-head">
                                    <div className="author-image">
                                      <img
                                        src={`${
                                          import.meta.env.VITE_BASE_URL
                                        }/${review.user.userImage}`}
                                        alt=""
                                        onError={(e) =>
                                          (e.currentTarget.src = reviewauthor)
                                        }
                                      />
                                    </div>
                                    <div className="author-name">
                                      <div className="author-rating">
                                        <Rating
                                          name="read-only"
                                          value={review.rating || 1}
                                          sx={{ fontSize: "40px" }}
                                          precision={0.5}
                                          readOnly
                                        />
                                      </div>
                                      <h2>
                                        {`${review.user.firstName} ${review.user.lastName}`}
                                      </h2>
                                      <div className="author-para">
                                        <p>{review.content || ""}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )}

                        {/* View more / View less button */}
                        {reviews.length > 3 && (
                          <div
                            style={{ textAlign: "center", marginTop: "1rem" }}
                          >
                            <button
                              type="button"
                              className="view-more-reviews-btn"
                              onClick={() => setShowAllReviews((s) => !s)}
                            >
                              {showAllReviews
                                ? "View less"
                                : `View more (${reviews.length - 3})`}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}{" "}
          {relatedProducts && relatedProducts.length > 0 && (
            <RelatedProducts relatedProducts={relatedProducts} />
          )}
        </div>

        <div className="footer-sec">
          <div className="wrapper">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
