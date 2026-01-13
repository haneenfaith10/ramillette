import { useEffect, useState } from "react";
// import { SlMagnifier } from "react-icons/sl";
import { FaSlidersH } from "react-icons/fa";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
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
  onCloseMobileFilter,
}) {
  const [gender, setGender] = useState("");
  const [searchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  // const [sortBy, setSortBy] = useState("Sort By");
  const [openSection, setOpenSection] = useState({
    jewellery: true,
    variant: true,
    price: true,
    rating: false,
    occasion: false,
  });
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
    setOpenSection((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  useEffect(() => {
    getActiveCategories(setCategories);
  }, []);

  // Reset open sections when mobile drawer opens (close all dropdown sections)
  useEffect(() => {
    if (isMobileFilterOpen) {
      setOpenSection({
        jewellery: false,
        variant: false,
        price: false,
        rating: false,
        occasion: false,
      });
    }
  }, [isMobileFilterOpen]);

  // Get active filter chips data
  const getActiveFilters = () => {
    const activeFilters = [];
    
    // Add category filters
    safeCategory.forEach((catId) => {
      const cat = categories.find((c) => c._id === catId);
      if (cat) {
        activeFilters.push({ type: 'category', id: catId, label: cat.categoryName });
      }
    });
    
    // Add variant filter
    if (selectedVariant) {
      activeFilters.push({ type: 'variant', id: selectedVariant, label: selectedVariant });
    }
    
    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  const removeFilter = (filter) => {
    if (filter.type === 'category') {
      setCategory(safeCategory.filter((id) => id !== filter.id));
    } else if (filter.type === 'variant') {
      setSelectedVariant("");
    }
  };

  const FilterContent = () => (
    <div className="filter-wrapper-new">
      <div className="filter-head-new">
        <h2 className="filter-title">Filter</h2>
        <button
          className="clear-filter-new"
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

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="active-filters-chips">
          {activeFilters.map((filter) => (
            <div key={`${filter.type}-${filter.id}`} className="filter-chip">
              <span>{filter.label}</span>
              <button
                className="chip-remove-btn"
                onClick={() => removeFilter(filter)}
                aria-label={`Remove ${filter.label} filter`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      {activeFilters.length > 0 && <div className="filter-divider" />}

      {/* Jewellery Type Section */}
      <div className="filter-section-new">
        <div className="filter-section-header" onClick={() => toggleSection("jewellery")}>
          <span className="filter-section-title">Category</span>
              <div className="filter-section-icon">
                {openSection.jewellery ? (
                  <IoChevronUp className="icon-up" />
                ) : (
                  <IoChevronDown className="icon-down" />
                )}
              </div>
        </div>
        {openSection.jewellery && (
          <div className="filter-section-content">
            <div className="filter-options-list">
              {categories?.map((item) => (
                <label key={item?._id} className="filter-option-item">
                  <input
                    type="checkbox"
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
          </div>
        )}
      </div>

      <div className="filter-divider" />

      {/* Variant/Style Section */}
      {variants.length > 0 && (
        <>
          <div className="filter-section-new">
            <div className="filter-section-header" onClick={() => toggleSection("variant")}>
              <span className="filter-section-title">Variant</span>
              <div className="filter-section-icon">
                {openSection.variant ? (
                  <IoChevronUp className="icon-up" />
                ) : (
                  <IoChevronDown className="icon-down" />
                )}
              </div>
            </div>
            {openSection.variant && (
              <div className="filter-section-content">
                <div className="filter-options-list">
                  {variants.map((variantName) => {
                    const isSelected = selectedVariant === variantName;
                    return (
                      <label key={variantName} className="filter-option-item" style={{ cursor: 'pointer' }}>
                        <span className="radio-wrapper">
                          <input
                            type="radio"
                            name="variant"
                            value={variantName}
                            checked={isSelected}
                            onChange={(e) => {
                              e.preventDefault();
                              if (isSelected) {
                                setSelectedVariant("");
                              } else {
                                setSelectedVariant(variantName);
                              }
                            }}
                            onClick={(e) => {
                              if (isSelected) {
                                e.preventDefault();
                                setSelectedVariant("");
                              }
                            }}
                          />
                          {isSelected && <span className="radio-dot"></span>}
                        </span>
                        <span>{variantName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="filter-divider" />
        </>
      )}

      {/* Price Section - KEEP EXACTLY AS IS */}
      <div className="filter-section">
        <span className="filter-label">PRICE</span>
        <Slider
          value={price}
          onChange={(e, newValue) => setPrice(newValue)}
          valueLabelDisplay="off"
          min={actualPriceRange[0]}
          max={actualPriceRange[1]}
          sx={{
            color: '#edc862',
            '& .MuiSlider-track': {
              backgroundColor: '#edc862',
              borderColor: '#edc862',
            },
            '& .MuiSlider-thumb': {
              backgroundColor: '#edc862',
              '&:hover': {
                backgroundColor: '#d4b04a',
              },
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#e5e7eb',
            },
          }}
        />
        <div className="price-range">
          <span>{selectedCountry.priceLabel}{Math.round(price[0]).toLocaleString()}</span>
          <span> – </span>
          <span>{selectedCountry.priceLabel}{Math.round(price[1]).toLocaleString()}+</span>
        </div>
      </div>
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
      <div className="filter-actions-mobile">
        <button
          className="apply-btn"
          onClick={() => {
            if (onCloseMobileFilter) {
              onCloseMobileFilter();
            }
            setIsMobileFilterOpen(false);
          }}
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
          <span>{openSection.price ? "−" : "+"}</span>
        </div>
        {openSection.price && (
          <div className="dropdown-content">
            <Slider
              value={price}
              onChange={(e, newValue) => setPrice(newValue)}
              valueLabelDisplay="off"
              min={actualPriceRange[0]}
              max={actualPriceRange[1]}
            />
            <div className="price-range">
              {selectedCountry.priceLabel}{price[0]} – {selectedCountry.priceLabel}{price[1]}+
            </div>
          </div>
        )}
      </div>

      <div className="filter-actions-mobile">
        <button
          className="apply-btn"
          onClick={() => {
            if (onCloseMobileFilter) {
              onCloseMobileFilter();
            }
            setIsMobileFilterOpen(false);
          }}
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
            { name: "Category/Type", key: "jewellery" },
            { name: "Price", key: "price" },
            { name: "Variant", key: "variant" },
          ].map((section) => (
            <div key={section.key} className="dropdown-section">
              <div
                className="dropdown-header"
                onClick={() => toggleSection(section.key)}
              >
                <span>{section.name}</span>
                <span className="dropdown-content-arrow">
                  {openSection[section.key] ? (
                    <IoChevronUp />
                  ) : (
                    <IoChevronDown />
                  )}
                </span>
              </div>

              {openSection[section.key] && (
                <div className="dropdown-content">
                  {section.key === "price" && (
                    <>
                      <Slider
                        value={price}
                        onChange={(e, newValue) => setPrice(newValue)}
                        valueLabelDisplay="off"
                        min={actualPriceRange[0]}
                        max={actualPriceRange[1]}
                        sx={{
                          color: '#edc862',
                          '& .MuiSlider-track': {
                            backgroundColor: '#edc862',
                            borderColor: '#edc862',
                          },
                          '& .MuiSlider-thumb': {
                            backgroundColor: '#edc862',
                            '&:hover': {
                              backgroundColor: '#d4b04a',
                            },
                          },
                          '& .MuiSlider-rail': {
                            backgroundColor: '#e5e7eb',
                          },
                        }}
                      />
                      <div className="price-range">
                        {selectedCountry.priceLabel}{price[0]} – {selectedCountry.priceLabel}{price[1]}+
                      </div>
                    </>
                  )}
                  {section.key === "variant" && (
                    <div className="gender-section">
                      {variants.map((variantName) => {
                        const isSelected = selectedVariant === variantName;
                        return (
                          <label key={variantName} className="gender-option" style={{ cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="variant-mobile"
                              value={variantName}
                              checked={isSelected}
                              onChange={(e) => {
                                e.preventDefault();
                                if (isSelected) {
                                  setSelectedVariant("");
                                } else {
                                  setSelectedVariant(variantName);
                                }
                              }}
                              onClick={(e) => {
                                if (isSelected) {
                                  e.preventDefault();
                                  setSelectedVariant("");
                                }
                              }}
                            />
                            <span>{variantName}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {section.key === "jewellery" && (
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
            onClick={() => {
              if (onCloseMobileFilter) {
                onCloseMobileFilter();
              }
              setIsMobileFilterOpen(false);
            }}
          >
            Apply Filters
          </button>
          <button
            className="clear-btn"
            onClick={() => {
              setGender("");
              setPrice([actualPriceRange[0], actualPriceRange[1]]);
              setOpenSection({
                jewellery: false,
                variant: false,
                price: false,
                rating: false,
                occasion: false,
              });
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
