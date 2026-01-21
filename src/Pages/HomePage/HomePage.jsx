import React, { useEffect, useState, useLayoutEffect } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { getTestimonialData } from "../../services/testimonialApiServices";
import { setAppLoading } from "../../redux/slices/userSlice";
import { getBannersForUser } from "../../services/bannerServices";
import { getBestSellerForUser } from "../../services/bestSellerApiService";
import { getActiveCategories } from "../../services/categoryApiServices";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function HomePage() {
  const [latestProducts, setLatestProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const [reviews, setReviews] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    if (selectedCountry?._id) {
      dispatch(setAppLoading(true));
    }
  }, [dispatch, selectedCountry?._id]);

  useEffect(() => {
    (async () => {
      if (selectedCountry?._id) {
        try {
          await Promise.all([
            getLatestProductsForUser(
              8,
              setLatestProducts,
              selectedCountry?._id,
            ),
            getTestimonialData(setReviews),
            getBannersForUser(selectedCountry._id, setBanners),
            getBestSellerForUser(selectedCountry._id, setBestSellers),
            getActiveCategories(setCategories),
          ]);
        } catch (error) {
          console.error("Error fetching homepage data:", error);
        } finally {
          setLocalLoading(false);
          dispatch(setAppLoading(false));
        }
      }
    })();
  }, [selectedCountry?._id, dispatch]);

  if (localLoading || !selectedCountry?._id) {
    return null;
  }

  return (
    <main className="homepage">
      <TopHeader />
      <NavBar />
      <Banner bannersData={banners} />
      <div className="product-sec">
        <div className="container">
          <h2>
            Latest <span>Products</span>
          </h2>
          {/* Grid layout for desktop */}
          <div className="product-cards-row product-cards-grid">
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
          {/* Slider layout - same as BestSeller */}
          <div className="product-cards-slider">
            {latestProducts && latestProducts.length > 0 ? (
              <Slider
                infinite={true}
                speed={800}
                slidesToShow={4}
                slidesToScroll={1}
                autoplay={false}
                arrows={true}
                cssEase="cubic-bezier(0.4, 0, 0.2, 1)"
                easing="ease-in-out"
                responsive={[
                  {
                    breakpoint: 1200,
                    settings: {
                      slidesToShow: 3,
                      infinite: true,
                      autoplay: false,
                      arrows: true,
                    },
                  },
                  {
                    breakpoint: 991,
                    settings: {
                      slidesToShow: 2,
                      infinite: true,
                      autoplay: false,
                      arrows: true,
                    },
                  },
                  {
                    breakpoint: 480,
                    settings: {
                      slidesToShow: 1,
                      infinite: true,
                      autoplay: false,
                      arrows: true,
                    },
                  },
                ]}
              >
                {latestProducts.slice(0, 4).map((product) => (
                  <div key={product._id}>
                    <Productcard product={product} maxLength={27} />
                  </div>
                ))}
              </Slider>
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
          <Bestseller bestSellersData={bestSellers} />
        </div>
      </div>
      <div className="category-sec">
        <div className="container">
          <h2>
            Shop By <span> Category</span>
          </h2>
          <Category categoriesData={categories} />
        </div>
      </div>
      <div className="shippping-sec">
        <div className="container">
          <Shipping />
        </div>
      </div>
      {/* <div className="secondry-banner-sec">
        <SecondryBanner />
      </div> */}
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
