import React, { useEffect, useMemo, useState } from "react";
import TopHeader from "../../Components/TopHeader/TopHeader";
import NavBar from "../../Components/NavBar/NavBar";
import FilterSide from "../../Components/FilterSide/FilterSide";
import "./Productlist.css";
import Productolistproductcard from "../../Components/Productolistproductcard/Productolistproductcard";
import Testimonial from "../../Components/Testimonial/Testimonial";
import Footer from "../../Components/Footer/Footer";
import {
  getAllProductsForUser,
  getSearchResult,
} from "../../services/productApiServices";
import { getUserWishlist } from "../../services/wishlistApiServices";
import { useDispatch, useSelector } from "react-redux";
import { updateUserWishList } from "../../redux/slices/userSlice";
import { getAllReviews } from "../../services/ratingApiServices";
import { useSearchParams } from "react-router-dom";
import { getDiscountedPrice } from "../../utils/calculation";
import { Tooltip } from "@mui/material";
import { TfiLayoutGrid3 } from "react-icons/tfi";
import { TfiLayoutGrid4 } from "react-icons/tfi";

export default function Productlist() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [category, setCategory] = useState([]);
  const { user } = useSelector((state) => state.user);
  const [actualPriceRange, setActualPriceRange] = useState([0, 100]);
  const [reviews, setReviews] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [gridCount, setGridCount] = useState("4");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1200);
  const selectedCountry = useSelector((state) => state?.user?.selectedCountry);
  const query = searchParams.get("query");
  const countryId = searchParams.get("countryId");

  useEffect(() => {
    (async () => {
      if (user?.id) {
        const response = await getUserWishlist(user?.id);
        if (response) {
          dispatch(updateUserWishList({ user: response?.wishlist?.products }));
        }
      }
    })();
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (selectedCountry._id) {
      getAllReviews(selectedCountry._id, user?.id, setReviews);
    }
  }, [selectedCountry._id, user?.id]);

  const filteredProducts = useMemo(() => {
    const [minPrice, maxPrice] = priceRange;

    // Ensure selectedCountry exists before processing
    if (!selectedCountry?._id || !Array.isArray(products)) {
      return [];
    }

    return products
      .map((product) => {
        const variants = product.countryVariants?.[selectedCountry._id] || [];

        const filteredVariants = variants.filter((variant) => {
          const basePrice = Number(variant.price);

          const discountPercent = Number(product.productDiscount || 0);
          const discountedPrice = getDiscountedPrice(
            basePrice,
            discountPercent
          );

          const variantNameMatch =
            !selectedVariant || variant.variantName === selectedVariant;

          return (
            discountedPrice >= minPrice &&
            discountedPrice <= maxPrice &&
            variantNameMatch
          );
        });

        // Ensure category is always an array for safe operations
        const safeCategory = Array.isArray(category) ? category : [];
        const matchesCategory =
          safeCategory.length === 0 ||
          product.productCategory?.some((cat) => safeCategory.includes(cat._id));

        if (filteredVariants.length === 0 || !matchesCategory) {
          return null;
        }
        return {
          ...product,
          filteredVariants,
        };
      })
      .filter(Boolean);
  }, [priceRange, products, category, selectedCountry._id, selectedVariant]);

  // !

  const discountedPriceRange = useMemo(() => {
    const discountedPrices = products
      .flatMap((product) => {
        const variants = product.countryVariants?.[selectedCountry._id] || [];

        return variants.map((variant) => {
          const basePrice = Number(variant.price);
          const discountPercent = Number(product.productDiscount || 0);
          return getDiscountedPrice(basePrice, discountPercent);
        });
      })
      .filter((price) => !isNaN(price));

    if (discountedPrices.length === 0) {
      return [0, 1000];
    }

    const min = Math.min(...discountedPrices);
    const max = Math.max(...discountedPrices);
    return [min, max];
  }, [products, selectedCountry._id]);

  useEffect(() => {
    if (
      discountedPriceRange[0] !== discountedPriceRange[1] &&
      ![Infinity, -Infinity].includes(discountedPriceRange[0]) &&
      ![Infinity, -Infinity].includes(discountedPriceRange[1])
    ) {
      setPriceRange(discountedPriceRange);
      setActualPriceRange(discountedPriceRange);
    }
  }, [discountedPriceRange]);

  useEffect(() => {
    if (!query && !countryId) {
      if (selectedCountry?._id) {
        getAllProductsForUser(setProducts, selectedCountry?._id);
      }
    } else {
      getSearchResult(query, countryId, setProducts);
    }
  }, [selectedCountry?._id, countryId, query]);

  const allVariants = useMemo(() => {
    const variantsSet = new Set();

    products.forEach((product) => {
      const variants = product.countryVariants?.[selectedCountry._id] || [];
      variants.forEach((variant) => {
        if (variant?.variantName) {
          variantsSet.add(variant.variantName);
        }
      });
    });

    return Array.from(variantsSet);
  }, [products, selectedCountry._id]);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 1200;
      setIsDesktop(desktop);

      // ✅ If switching to non-desktop and current grid is 4 → change to 3
      if (!desktop && gridCount === "4") {
        setGridCount("3");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gridCount]);

  return (
    <div className="product-list-main-wrapper">
      <div className="product-listing-page">
        <TopHeader />
        <NavBar />
        <div className="product-list-page">
          <div className="wrapper">
            <div className="product-list-page-wrap">
              <div className="product-left">
                <FilterSide
                  price={priceRange}
                  setPrice={setPriceRange}
                  setCategory={setCategory}
                  actualPriceRange={actualPriceRange}
                  category={category}
                  variants={allVariants}
                  setSelectedVariant={setSelectedVariant}
                  selectedVariant={selectedVariant}
                />
              </div>
              <div className="product-right">
                <div className="product-list-cards">
                  {filteredProducts && filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      return (
                        <div
                          className={`product-list-post-card ${
                            gridCount === "4" && "four-grid"
                          } ${gridCount === "3" && "three-grid"}`}
                          key={product._id}
                        >
                          <Productolistproductcard product={product} />
                        </div>
                      );
                    })
                  ) : (
                    // need to implement no product found page
                    <div className="product-list-empty-product-fallback">
                      <p>No products available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="testimonial-sec">
          <div className="wrapper">
            <Testimonial reviews={reviews} />
          </div>
        </div>
        <div className="footer-sec">
          <div className="wrapper">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
