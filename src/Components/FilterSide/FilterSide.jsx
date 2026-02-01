import { useEffect, useState } from "react";
// import { SlMagnifier } from "react-icons/sl";
import { FaSlidersH } from "react-icons/fa";
import { IoChevronDown, IoChevronUp, IoClose } from "react-icons/io5";
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
  const [openSection, setOpenSection] = useState({
    jewellery: true,
    variant: true,
    price: true,
    rating: false,
    occasion: false,
  });
  const [categories, setCategories] = useState([]);
  const selectedCategory = searchParams.get("category");
  const selectedCountry = useSelector((state) => state.user.selectedCountry);

  // Ensure category is always an array for safe operations
  const safeCategory = Array.isArray(category) ? category : [];

  // Initialize category from URL param - convert string to array
  useEffect(() => {
    if (selectedCategory) {
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

  // Get active filter chips data
  const getActiveFilters = () => {
    const activeFilters = [];

    // Add category filters
    safeCategory.forEach((catId) => {
      const cat = categories.find((c) => c._id === catId);
      if (cat) {
        activeFilters.push({
          type: "category",
          id: catId,
          label: cat.categoryName,
        });
      }
    });

    // Add variant filter
    if (selectedVariant) {
      activeFilters.push({
        type: "variant",
        id: selectedVariant,
        label: selectedVariant,
      });
    }

    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  const removeFilter = (filter) => {
    if (filter.type === "category") {
      setCategory(safeCategory.filter((id) => id !== filter.id));
    } else if (filter.type === "variant") {
      setSelectedVariant("");
    }
  };

  const FilterContent = () => (
    <div className="filter-wrapper-new">
      <div className="filter-head-new">
        <h2 className="filter-title">Filter</h2>
        <div className="filter-head-actions">
          <button
            className="filter-close-btn"
            onClick={() => onCloseMobileFilter && onCloseMobileFilter()}
            aria-label="Close filters"
          >
            <IoClose />
          </button>
        </div>
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

      {/* Categories Section */}
      <div className="filter-section-new">
        <div
          className="filter-section-header"
          onClick={() => toggleSection("jewellery")}
        >
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

      {/* Variant Section */}
      {variants.length > 0 && (
        <>
          <div className="filter-section-new">
            <div
              className="filter-section-header"
              onClick={() => toggleSection("variant")}
            >
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
                      <label
                        key={variantName}
                        className="filter-option-item"
                        style={{ cursor: "pointer" }}
                      >
                        <span className="radio-wrapper">
                          <input
                            type="radio"
                            name="variant"
                            value={variantName}
                            checked={isSelected}
                            onChange={(e) => {
                              if (isSelected) {
                                setSelectedVariant("");
                              } else {
                                setSelectedVariant(variantName);
                              }
                            }}
                            onClick={(e) => {
                              if (isSelected) {
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

      {/* Price Section */}
      <div className="filter-section">
        <span className="filter-label">PRICE</span>
        <Slider
          value={price}
          onChange={(e, newValue) => setPrice(newValue)}
          valueLabelDisplay="off"
          min={actualPriceRange[0]}
          max={actualPriceRange[1]}
          sx={{
            color: "#edc862",
            "& .MuiSlider-track": {
              backgroundColor: "#edc862",
              borderColor: "#edc862",
            },
            "& .MuiSlider-thumb": {
              backgroundColor: "#edc862",
              "&:hover": {
                backgroundColor: "#d4b04a",
              },
            },
            "& .MuiSlider-rail": {
              backgroundColor: "#e5e7eb",
            },
          }}
        />
        <div className="price-range">
          <span>
            {selectedCountry.priceLabel}
            {Math.round(price[0]).toLocaleString()}
          </span>
          <span> – </span>
          <span>
            {selectedCountry.priceLabel}
            {Math.round(price[1]).toLocaleString()}+
          </span>
        </div>
      </div>

      {/* Sticky Bottom Actions - Mobile Only */}
      <div className="filter-actions-mobile sticky-bottom">
        <button
          className="apply-btn"
          onClick={() => onCloseMobileFilter && onCloseMobileFilter()}
        >
          Apply Filters
        </button>
        <button
          className="clear-btn"
          onClick={() => {
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

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="filter-side desktop-only">{FilterContent()}</div>

      {/* Mobile Filter Drawer */}
      <div className={`mobile-filter-drawer h-full overflow-y-auto`}>
        {FilterContent()}
      </div>
    </>
  );
}
