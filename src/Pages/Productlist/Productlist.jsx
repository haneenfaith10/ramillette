import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import {
  updateUserWishList,
  setAppLoading,
} from "../../redux/slices/userSlice";
import { getAllReviews } from "../../services/ratingApiServices";
import { useSearchParams } from "react-router-dom";
import { getDiscountedPrice } from "../../utils/calculation";
import { IoChevronDown, IoClose } from "react-icons/io5";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowsUpDown,
} from "react-icons/hi2";
import { getActiveCategories } from "../../services/categoryApiServices";

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
  const [gridCount, setGridCount] = useState("3");
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const selectedCountry = useSelector((state) => state?.user?.selectedCountry);
  const query = searchParams.get("query");
  const countryId = searchParams.get("countryId");

  // Close filter on outside click
  const handleOverlayClick = useCallback((e) => {
    if (e.target.classList.contains("mobile-filter-overlay")) {
      setIsMobileFilterOpen(false);
    }
  }, []);

  // Prevent body scroll
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMobileFilterOpen]);

  // All your existing useEffects (unchanged)
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

  useEffect(() => {
    getActiveCategories(setCategories);
  }, []);

  // All your existing memos and logic (unchanged)
  const filteredProducts = useMemo(() => {
    const [minPrice, maxPrice] = priceRange;
    if (!selectedCountry?._id || !Array.isArray(products)) return [];
    return products
      .map((product) => {
        const variants = product.countryVariants?.[selectedCountry._id] || [];
        const filteredVariants = variants.filter((variant) => {
          const basePrice = Number(variant.price);
          const discountPercent = Number(product.productDiscount || 0);
          const discountedPrice = getDiscountedPrice(
            basePrice,
            discountPercent,
          );
          const variantNameMatch =
            !selectedVariant || variant.variantName === selectedVariant;
          return (
            discountedPrice >= minPrice &&
            discountedPrice <= maxPrice &&
            variantNameMatch
          );
        });
        const safeCategory = Array.isArray(category) ? category : [];
        const matchesCategory =
          safeCategory.length === 0 ||
          product.productCategory?.some((cat) =>
            safeCategory.includes(cat._id),
          );
        if (filteredVariants.length === 0 || !matchesCategory) return null;
        return { ...product, filteredVariants };
      })
      .filter(Boolean);
  }, [priceRange, products, category, selectedCountry._id, selectedVariant]);

  const sortedProducts = useMemo(() => {
    if (!filteredProducts || filteredProducts.length === 0) return [];
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "priceLow":
        return sorted.sort((a, b) => {
          const variantsA = a.filteredVariants || [];
          const variantsB = b.filteredVariants || [];
          if (variantsA.length === 0 || variantsB.length === 0) return 0;
          const basePriceA = Math.min(
            ...variantsA.map((v) => Number(v.price) || 0),
          );
          const basePriceB = Math.min(
            ...variantsB.map((v) => Number(v.price) || 0),
          );
          const discountA = Number(a.productDiscount || 0);
          const discountB = Number(b.productDiscount || 0);
          const priceA = getDiscountedPrice(basePriceA, discountA);
          const priceB = getDiscountedPrice(basePriceB, discountB);
          return priceA - priceB;
        });
      case "priceHigh":
        return sorted.sort((a, b) => {
          const variantsA = a.filteredVariants || [];
          const variantsB = b.filteredVariants || [];
          if (variantsA.length === 0 || variantsB.length === 0) return 0;
          const basePriceA = Math.min(
            ...variantsA.map((v) => Number(v.price) || 0),
          );
          const basePriceB = Math.min(
            ...variantsB.map((v) => Number(v.price) || 0),
          );
          const discountA = Number(a.productDiscount || 0);
          const discountB = Number(b.productDiscount || 0);
          const priceA = getDiscountedPrice(basePriceA, discountA);
          const priceB = getDiscountedPrice(basePriceB, discountB);
          return priceB - priceA;
        });
      case "nameAsc":
        return sorted.sort((a, b) =>
          a.productName
            ?.toLowerCase()
            .localeCompare(b.productName?.toLowerCase() || ""),
        );
      case "nameDesc":
        return sorted.sort((a, b) =>
          b.productName
            ?.toLowerCase()
            .localeCompare(a.productName?.toLowerCase() || ""),
        );
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

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
    if (discountedPrices.length === 0) return [0, 1000];
    return [Math.min(...discountedPrices), Math.max(...discountedPrices)];
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
    (async () => {
      setIsLoading(true);
      try {
        if (!query && !countryId) {
          if (selectedCountry?._id) {
            await getAllProductsForUser(setProducts, selectedCountry?._id);
          }
        } else {
          await getSearchResult(query, countryId, setProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
        dispatch(setAppLoading(false));
      }
    })();
  }, [selectedCountry?._id, countryId, query]);

  const allVariants = useMemo(() => {
    const variantsSet = new Set();
    products.forEach((product) => {
      const variants = product.countryVariants?.[selectedCountry._id] || [];
      variants.forEach(
        (variant) =>
          variant?.variantName && variantsSet.add(variant.variantName),
      );
    });
    return Array.from(variantsSet);
  }, [products, selectedCountry._id]);

  return (
    <div className="product-list-main-wrapper">
      <div className="product-listing-page">
        <TopHeader />
        <NavBar />
        <div className="product-list-page">
          <div className="container">
            {/* MOBILE FILTER OVERLAY */}
            {isMobileFilterOpen && (
              <div
                className="mobile-filter-overlay show"
                onClick={handleOverlayClick}
              />
            )}

            <div className="product-list-page-wrap">
              {/* FILTER SIDEBAR - HIDDEN ON MOBILE BY DEFAULT */}
              <div
                className={`product-left ${
                  isMobileFilterOpen ? "mobile-open" : ""
                }`}
              >
                {/* Filter content starts directly */}
                <FilterSide
                  price={priceRange}
                  setPrice={setPriceRange}
                  setCategory={setCategory}
                  actualPriceRange={actualPriceRange}
                  category={category}
                  variants={allVariants}
                  setSelectedVariant={setSelectedVariant}
                  selectedVariant={selectedVariant}
                  onCloseMobileFilter={() => setIsMobileFilterOpen(false)}
                />
              </div>

              <div className="product-right">
                <div className="product-list-header">
                  <div className="product-list-header-left">
                    <h1 className="product-list-title desktop-only">
                      Products
                    </h1>
                    <p className="product-list-count">
                      <span className="product-count-number">
                        {sortedProducts.length}
                      </span>
                      <span className="product-count-text">
                        {" "}
                        Products found
                      </span>
                    </p>
                  </div>

                  {/* DESKTOP SORT */}
                  <div className="product-list-sort desktop-sort">
                    <span className="sort-label">Sort by:</span>
                    <div className="sort-dropdown-wrapper">
                      <button
                        className="sort-dropdown-button"
                        onClick={() =>
                          setIsSortDropdownOpen(!isSortDropdownOpen)
                        }
                        onBlur={() =>
                          setTimeout(() => setIsSortDropdownOpen(false), 200)
                        }
                      >
                        <span className="sort-selected-value">
                          {sortBy === "recommended" && "Recommended"}
                          {sortBy === "priceLow" && "Price: Low to High"}
                          {sortBy === "priceHigh" && "Price: High to Low"}
                          {sortBy === "nameAsc" && "Name: A to Z"}
                          {sortBy === "nameDesc" && "Name: Z to A"}
                        </span>
                        <IoChevronDown
                          className={`sort-arrow-icon ${
                            isSortDropdownOpen ? "open" : ""
                          }`}
                        />
                      </button>
                      {isSortDropdownOpen && (
                        <div className="sort-dropdown-menu">
                          <button
                            className={`sort-option ${
                              sortBy === "recommended" ? "active" : ""
                            }`}
                            onClick={() => {
                              setSortBy("recommended");
                              setIsSortDropdownOpen(false);
                            }}
                          >
                            Recommended
                          </button>
                          <button
                            className={`sort-option ${
                              sortBy === "priceLow" ? "active" : ""
                            }`}
                            onClick={() => {
                              setSortBy("priceLow");
                              setIsSortDropdownOpen(false);
                            }}
                          >
                            Price: Low to High
                          </button>
                          <button
                            className={`sort-option ${
                              sortBy === "priceHigh" ? "active" : ""
                            }`}
                            onClick={() => {
                              setSortBy("priceHigh");
                              setIsSortDropdownOpen(false);
                            }}
                          >
                            Price: High to Low
                          </button>
                          <button
                            className={`sort-option ${
                              sortBy === "nameAsc" ? "active" : ""
                            }`}
                            onClick={() => {
                              setSortBy("nameAsc");
                              setIsSortDropdownOpen(false);
                            }}
                          >
                            Name: A to Z
                          </button>
                          <button
                            className={`sort-option ${
                              sortBy === "nameDesc" ? "active" : ""
                            }`}
                            onClick={() => {
                              setSortBy("nameDesc");
                              setIsSortDropdownOpen(false);
                            }}
                          >
                            Name: Z to A
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="product-list-cards">
                  {isLoading ? (
                    // Render 6 skeleton cards while loading
                    [...Array(6)].map((_, index) => (
                      <div
                        className={`product-list-post-card ${
                          gridCount === "4" && "four-grid"
                        } ${gridCount === "3" && "three-grid"}`}
                        key={`skeleton-${index}`}
                      >
                        <div className="product-list-card skeleton-card">
                          <div className="image-wrapper skeleton-shimmer">
                            <div className="skeleton-image"></div>
                          </div>
                          <div className="product-details">
                            <div className="skeleton-text skeleton-shimmer name-skeleton"></div>
                            <div className="skeleton-text skeleton-shimmer price-skeleton"></div>
                            <div className="skeleton-button skeleton-shimmer"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : sortedProducts.length > 0 ? (
                    sortedProducts.map((product) => (
                      <div
                        className={`product-list-post-card ${
                          gridCount === "4" && "four-grid"
                        } ${gridCount === "3" && "three-grid"}`}
                        key={product._id}
                      >
                        <Productolistproductcard product={product} />
                      </div>
                    ))
                  ) : (
                    <div className="product-list-empty-product-fallback">
                      <p>No products available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MOBILE FLOATING ACTIONS BAR */}
            <div className="mobile-floating-actions">
              <button
                className="floating-action-btn"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <HiOutlineAdjustmentsHorizontal size={16} />
                <span>Filter by</span>
              </button>
              <div className="vertical-divider"></div>
              <button
                className="floating-action-btn"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              >
                <HiOutlineArrowsUpDown size={16} />
                <span>Sort by</span>
              </button>

              {/* MOBILE SORT DROPDOWN (Positioned relative to bar) */}
              {isSortDropdownOpen && (
                <div className="floating-sort-menu">
                  <button
                    className={`sort-option ${
                      sortBy === "recommended" ? "active" : ""
                    }`}
                    onClick={() => {
                      setSortBy("recommended");
                      setIsSortDropdownOpen(false);
                    }}
                  >
                    Recommended
                  </button>
                  <button
                    className={`sort-option ${
                      sortBy === "priceLow" ? "active" : ""
                    }`}
                    onClick={() => {
                      setSortBy("priceLow");
                      setIsSortDropdownOpen(false);
                    }}
                  >
                    Price: Low to High
                  </button>
                  <button
                    className={`sort-option ${
                      sortBy === "priceHigh" ? "active" : ""
                    }`}
                    onClick={() => {
                      setSortBy("priceHigh");
                      setIsSortDropdownOpen(false);
                    }}
                  >
                    Price: High to Low
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="testimonial-sec">
          <div className="container">
            <Testimonial reviews={reviews} />
          </div>
        </div>
        <div className="footer-sec">
          <div className="">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
