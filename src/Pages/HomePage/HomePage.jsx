import React, { useEffect, useState } from "react";
import TopHeader from "../../Components/TopHeader/TopHeader";
import NavBar from "../../Components/NavBar/NavBar";
import Banner from "../../Components/Banner/Banner";
import "./HomePage.css";
import Bestseller from "../../Components/BestSeller/BestSeller";
import Category from "../../Components/Category/Category";
import Productcard from "../../Components/ProductCard/Productcard";
import SecondryBanner from "../../Components/SecondryBanner/SecondryBanner";
import Testimonial from "../../Components/Testimonial/Testimonial";
import Shipping from "../../Components/Shipping/Shipping";
import Footer from "../../Components/Footer/Footer";
import { getLatestProductsForUser } from "../../services/productApiServices";
import { useSelector } from "react-redux";
import { getTestimonialData } from "../../services/testimonialApiServices";

export default function HomePage() {
  const [latestProducts, setLatestProducts] = useState([]);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [reviews, setReviews] = useState([]);
  // const userId = useSelector((state) => state.user.user.id);

  useEffect(() => {
    if (selectedCountry?._id) {
      getLatestProductsForUser(8, setLatestProducts, selectedCountry?._id);
    }
  }, [selectedCountry?._id]);

  useEffect(() => {
    getTestimonialData(setReviews);
  }, []);

  return (
    <main className="homepage">
      <TopHeader />
      <NavBar />
      <Banner />
      <div className="product-sec">
        <div className="container">
          <h2>
            Latest <span>Products</span>
          </h2>
          <div className="product-cards-row">
            {latestProducts && latestProducts.length > 0 ? (
              latestProducts
                .slice(0, 4)
                .map((product) => (
                  <Productcard
                    key={product._id}
                    product={product}
                    maxLength={27}
                  />
                ))
            ) : (
              <div className="no-product">No Product Found</div>
            )}
          </div>
        </div>
      </div>
      <div className="best-seller-sec">
        <div className="container">
          <h2>
            Discover <span>Our Bestsellers</span>
          </h2>
          <Bestseller />
        </div>
      </div>
      <div className="category-sec">
        <div className="container">
          <h2>
            Shop By <span> Category</span>
          </h2>
          <Category />
        </div>
      </div>
      <div className="shippping-sec">
        <div className="container">
          <Shipping />
        </div>
      </div>
      <div className="secondry-banner-sec">
        <SecondryBanner />
      </div>
      <div className="testimonial-sec">
        <div className="container">
          <Testimonial reviews={reviews} />
        </div>
      </div>
      <div className="footer-sec">
        <div className="wrapper">
          <Footer />
        </div>
      </div>
    </main>
  );
}
