import { useEffect, useState } from "react";
// import { SlMagnifier } from "react-icons/sl";
import { FaSlidersH } from "react-icons/fa";
import Slider from "@mui/material/Slider";
import "./FilterSide.css";
import { getActiveCategories } from "../../services/categoryApiServices";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function FilterSide({
  price,
  setPrice,
  setCategory,
  actualPriceRange,
  category,
  variants,
  setSelectedVariant,
  selectedVariant,
}) {
  const [gender, setGender] = useState("");
  const [searchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  // const [sortBy, setSortBy] = useState("Sort By");
  const [openSection, setOpenSection] = useState("");
  const [categories, setCategories] = useState([]);
  const selectedCategory = searchParams.get("category");
  // const [selectedVariant, setSelectedVariant] = useState("");
  const selectedCountry = useSelector((state) => state.user.selectedCountry);

  // Ensure category is always an array for safe operations
  const safeCategory = Array.isArray(category) ? category : [];

  // Initialize category from URL param - convert string to array
  useEffect(() => {
    if (selectedCategory) {
      // Convert URL param (string) to array format
      setCategory([selectedCategory]);
    }
  }, [selectedCategory, setCategory]);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? "" : section);
  };
  
  useEffect(() => {
    getActiveCategories(setCategories);
  }, []);

  // Reset open sections when mobile drawer opens (close all dropdown sections)
  useEffect(() => {
    if (isMobileFilterOpen) {
      setOpenSection("");
    }
  }, [isMobileFilterOpen]);

  const FilterContent = () => (
    <div className="wrapper">
      <div className="filter-head">
        <h2>Filters</h2>
          <button
            className="clear-filter"
            onClick={() => {
              setGender("");
              setCategory([]);
              setPrice([actualPriceRange[0], actualPriceRange[1]]);
              setSelectedVariant("");
            }}
          >
            Clear All
          </button>
      </div>
      <div className="filter-section">
        <span className="filter-label">PRICE</span>
        <Slider
          value={price}
          onChange={(e, newValue) => setPrice(newValue)}
          valueLabelDisplay="off"
          min={actualPriceRange[0]}
          max={actualPriceRange[1]}
        />
        <div className="price-range">
          {`${selectedCountry.priceLabel} ${price[0]} – ${selectedCountry.priceLabel} ${price[1]}+`}
        </div>
      </div>
      <div className="filter-section">
        <div className="gender-filter">
          {categories?.map((item) => (
            <label key={item?._id} className="gender-option">
              <input
                type="checkbox"
                name="gender"
                value={item._id}
                checked={safeCategory.includes(item._id)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  const safePrev = Array.isArray(category) ? category : [];
                  
                  if (isChecked) {
                    setCategory([...safePrev, item._id]);
                  } else {
                    setCategory(safePrev.filter((id) => id !== item._id));
                  }
                }}
              />
              <span>{item.categoryName}</span>
            </label>
          ))}
        </div>
        <div className="gender-section">
          <span className="variant-title">Variant</span>
          {variants.map((variantName) => (
            <label key={variantName} className="gender-option">
              <input
                type="radio"
                name="variant"
                value={variantName}
                checked={selectedVariant === variantName}
                onChange={() => setSelectedVariant(variantName)}
              />
              <span>{variantName}</span>
            </label>
          ))}
        </div>
      </div>

      {/* <hr /> */}
      {/* <div className="filter-section">
        <div className="brand-header">
          <span className="filter-label">BRAND</span>
          <div className="brand-search-icon">
            <SlMagnifier />
          </div>
        </div>
        <div className="brand-list">
          {brands.map((brand, index) => (
            <label key={index} className="brand-option">
              <input type="checkbox" />
              <span>{brand.name}</span>
              <span className="brand-count">({brand.count})</span>
            </label>
          ))}
          <button className="more-brands">+ 317 more</button>
        </div>
      </div> */}
      <hr />
      <div className="filter-actions-mobile">
        <button
          className="apply-btn"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          Apply Filters
        </button>
        <button
          className="clear-btn"
          onClick={() => {
            setGender("");
            setCategory([]);
            setPrice([actualPriceRange[0], actualPriceRange[1]]);
            setSelectedVariant("");
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  const MobileFilterDropdowns = () => (
    <div className="mobile-dropdown-wrapper">
      <div className="dropdown-section">
        {/* Gender Dropdown */}
        <div
          className="dropdown-header"
          onClick={() => toggleSection("gender")}
        >
          Gender
          <span>{openSection === "gender" ? "−" : "+"}</span>
        </div>
        {openSection === "gender" && (
          <div className="dropdown-content">
            {["Men", "Women", "Unisex"].map((item) => (
              <label key={item} className="gender-option">
                <span>{item}</span>
                <input
                  type="radio"
                  name="gender"
                  value={item}
                  checked={gender === item}
                  onChange={() => setGender(item)}
                />
              </label>
            ))}
          </div>
        )}

        {/* Brand Dropdown */}
        {/* <div className="dropdown-header" onClick={() => toggleSection("brand")}>
          Brand
          <span>{openSection === "brand" ? "−" : "+"}</span>
        </div>
        {openSection === "brand" && (
          <div className="dropdown-content">
            <div className="brand-search-icon">
              <SlMagnifier />
            </div>
            {brands.map((brand, index) => (
              <label key={index} className="brand-option">
                <input type="checkbox" />
                <span>{brand.name}</span>
                <span className="brand-count">({brand.count})</span>
              </label>
            ))}
            <button className="more-brands">+ 317 more</button>
          </div>
        )} */}

        {/* Price Dropdown */}
        <div className="dropdown-header" onClick={() => toggleSection("price")}>
          Price
          <span>{openSection === "price" ? "−" : "+"}</span>
        </div>
        {openSection === "price" && (
          <div className="dropdown-content">
            <Slider
              value={price}
              onChange={(e, newValue) => setPrice(newValue)}
              valueLabelDisplay="off"
              min={actualPriceRange[0]}
              max={actualPriceRange[1]}
            />
            <div className="price-range">
              ₹{price[0]} – ₹{price[1]}+
            </div>
          </div>
        )}
      </div>

      <div className="filter-actions-mobile">
        <button
          className="apply-btn"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          Apply Filters
        </button>
        <button
          className="clear-btn"
          onClick={() => {
            setGender("");
            setPrice([actualPriceRange[0], actualPriceRange[1]]);
            setSelectedVariant("");
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="filter-side desktop-only">{FilterContent()}</div>

      {/* Mobile Bottom Filter Bar */}
      <div className="mobile-bottom-bar">
        <button
          className="mobile-filter-trigger"
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <FaSlidersH style={{ marginRight: "8px" }} />
          Filters
        </button>
        {/* <div className="sort-by-dropdown">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option>Sort By</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="popularity">Popularity</option>
          </select>
        </div> */}
      </div>

      {/* Mobile Filter Drawer */}
      <div
        className={`mobile-filter-drawer ${isMobileFilterOpen ? "open" : ""}`}
      >
        <div className="drawer-header">
          <h2>Filters</h2>
          <span
            className="close-icon"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            ×
          </span>
        </div>

        {/* Mobile Dropdowns */}
        <div className="mobile-dropdown-wrapper">
          {[
            // "Occasion",
            "Category/Type",
            // "Fragrance Family",
            "Price",
            "Variant",
          ].map((section) => (
            <div key={section} className="dropdown-section">
              <div
                className="dropdown-header"
                onClick={() =>
                  setOpenSection(openSection === section ? "" : section)
                }
              >
                <span>{section}</span>
                <span className="dropdown-content-arrow">
                  {openSection === section ? "−" : "›"}
                </span>
              </div>

              {openSection === section && (
                <div className="dropdown-content">
                  {section === "Price" && (
                    <>
                      <Slider
                        value={price}
                        onChange={(e, newValue) => setPrice(newValue)}
                        valueLabelDisplay="off"
                        min={actualPriceRange[0]}
                        max={actualPriceRange[1]}
                      />
                      <div className="price-range">
                        ₹{price[0]} – ₹{price[1]}+
                      </div>
                    </>
                  )}
                  {section === "Variant" && (
                    <div className="gender-section">
                      {variants.map((variantName) => (
                        <label key={variantName} className="gender-option">
                          <input
                            type="radio"
                            name="variant-mobile" 
                            value={variantName}
                            checked={selectedVariant === variantName}
                            onChange={() => setSelectedVariant(variantName)}
                          />
                          <span>{variantName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {section === "Gender" && (
                    <div className="gender-filter">
                      {categories?.map((item) => (
                        <label key={item?._id} className="gender-option">
                          <span>{item.categoryName}</span>
                          <input
                            type="radio"
                            name="gender"
                            value={item.categoryName}
                            checked={gender === item.categoryName}
                            onChange={() => setGender(item.categoryName)}
                          />
                        </label>
                      ))}
                    </div>
                  )}
                  {/* Placeholder content */}
                  {section === "Category/Type" && (
                    <div className="gender-filter">
                      {categories?.map((item) => (
                        <label key={item?._id} className="gender-option">
                          <input
                            type="checkbox"
                            name="gender"
                            value={item._id}
                            checked={safeCategory.includes(item._id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const safePrev = Array.isArray(category) ? category : [];
                              
                              if (isChecked) {
                                setCategory([...safePrev, item._id]);
                              } else {
                                setCategory(safePrev.filter((id) => id !== item._id));
                              }
                            }}
                          />
                          <span>{item.categoryName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="filter-actions-mobile sticky-bottom">
          <button
            className="apply-btn"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            Apply Filters
          </button>
          <button
            className="clear-btn"
            onClick={() => {
              setGender("");
              setPrice([actualPriceRange[0], actualPriceRange[1]]);
              setOpenSection("");
              setCategory([]);
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </>
  );
}
