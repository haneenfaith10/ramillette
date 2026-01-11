import { useFormik } from "formik";
import "./AddProduct.css";
import * as Yup from "yup";
import { addProduct } from "../../services/productApiServices";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { IoClose, IoCloudUploadOutline } from "react-icons/io5";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import { getActiveCategories } from "../../services/categoryApiServices";
import { getActiveCountries } from "../../services/configApiService";
import Select from "react-select";
import Swal from "sweetalert2";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getAllBadges } from "../../services/badgeApiServices";
import { deleteOffer } from "../../services/offerApiService";
import { FaPlus } from "react-icons/fa6";

const SortableImage = ({
  id,
  image,
  index,
  onDelete,
  imageOrientations,
  handleOrientationChange,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="admin-add-product-images-preview"
      {...attributes}
    >
      <div className="drag-handle" {...listeners}>
        <span style={{ cursor: "grab" }}>⠿</span>
      </div>

      <img src={URL.createObjectURL(image)} alt={`product-${index}`} />

      <div
        className="admin-add-product-image-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete(index);
        }}
      >
        <IoClose />
      </div>
      <label>
        <input
          type="checkbox"
          checked={imageOrientations[index] === "portrait"}
          // onChange={e =>
          //   handleOrientationChange(index, e.target.checked ? "portrait" : "landscape")
          // }
        />
        Portrait
      </label>
    </div>
  );
};

function BadgeSelector({ selectedBadges, setSelectedBadges }) {
  const [badges, setBadges] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    getAllBadges(setBadges);
  }, []);

  const handleSelect = (badge) => {
    setSelectedBadges((prev) => [...prev, badge]);
  };

  const handleRemove = (badgeId) => {
    setSelectedBadges((prev) => prev.filter((b) => b._id !== badgeId));
  };

  const availableBadges = badges.filter(
    (badge) => !selectedBadges.some((b) => b._id === badge._id)
  );

  return (
    <div className="badge-selector-container">
      <label className="badge-label">Select Badges</label>

      <div
        className="badge-select-box"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span>
          {availableBadges.length ? "Choose badge(s)" : "No more badges"}
        </span>
        <span className="arrow">{dropdownOpen ? "▲" : "▼"}</span>
      </div>

      {dropdownOpen && availableBadges.length > 0 && (
        <div className="badge-select-dropdown">
          {availableBadges.map((badge) => (
            <div
              key={badge._id}
              className="badge-option"
              onClick={() => {
                handleSelect(badge);
                setDropdownOpen(false);
              }}
            >
              <img
                src={`${import.meta.env.VITE_BASE_URL}${badge.iconUrl}`}
                alt={badge.label}
              />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      )}

      {selectedBadges.length > 0 && (
        <div className="badge-preview-section">
          {selectedBadges.map((badge) => (
            <div key={badge._id} className="badge-card">
              <img
                src={`${import.meta.env.VITE_BASE_URL}${badge.iconUrl}`}
                alt={badge.label}
              />
              <span>{badge.label}</span>
              <button
                className="remove-btn"
                onClick={() => handleRemove(badge._id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddProduct() {
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor));
  const [productImages, setProductImages] = useState([]);
  const imageRef = useRef(null);
  const [categoryData, setCategoryData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const cleanupCalled = useRef(false);
  const [imageOrientations, setImageOrientations] = useState([]);

  useEffect(() => {
    const cleanupUnusedOffers = async () => {
      if (cleanupCalled.current) return; // prevent double run
      cleanupCalled.current = true;

      const offerIds = JSON.parse(localStorage.getItem("unsavedOffers")) || [];

      for (const id of offerIds) {
        try {
          await deleteOffer(id);
        } catch (error) {
          console.warn(
            `Error deleting offer ${id}`,
            error?.response?.data || error.message
          );
        }
      }

      localStorage.removeItem("unsavedOffers");
    };

    cleanupUnusedOffers();
  }, []);

  useEffect(() => {
    getActiveCategories(setCategoryData);
  }, []);

  useEffect(() => {
    (async () => {
      const response = await getActiveCountries();
      if (response) {
        setCountries(response);
      }
    })();
  }, []);

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      boxShadow: "none",
      borderColor: state.isFocused ? "#ccc" : "#ccc",
      "&:hover": {
        borderColor: "#aaa",
      },
    }),
  };

  const productValidationSchema = Yup.object().shape({
    productName: Yup.string()
      .required("Product name is required")
      .min(3, "Product name must be at least 3 characters"),

    productShortName: Yup.string()
      .required("Product short name is required")
      .max(20, "Short name can't exceed 20 characters"),

    productDiscount: Yup.number()
      .required("Product discount is required")
      .typeError("Discount must be a number")
      .positive("Discount must be greater than 0")
      .max(100, "Discount cannot exceed 100%")
      .min(0, "Discount cannot be negative"),

    productDescription: Yup.string()
      .required("Product description is required")
      .min(10, "Description must be at least 10 characters"),
    productBenefits: Yup.string()
      .required("Product benefits are required")
      .min(5, "Please describe at least one benefit"),

    productCategory: Yup.array()
      .of(
        Yup.string()
          .matches(/^[0-9a-fA-F]{24}$/, "Invalid category ID format")
          .required("Category ID is required")
      )
      .min(1, "At least one category must be selected")
      .required("Product category is required"),

    productRating: Yup.number()
      .typeError("Rating must be a number")
      .positive("Rating must be greater than 0")
      .max(5, "Rating cannot exceed 5"),

    productUseCase: Yup.string()
      .required("Product use case is required")
      .min(5, "Please describe a use case with minimum 5 characters"),

    productIngredients: Yup.string()
      .required("Product ingredients are required")
      .min(5, "Please describe ingredients with minimum 5 characters"),

    productOtherInfo: Yup.string()
      .min(5, "Other information must be at least 5 characters")
      .nullable(),
    productImages: Yup.array()
      .of(
        Yup.mixed()
          .test(
            "fileRequired",
            "Image is required",
            (file) => file instanceof File
          )
          .test("fileType", "Only image files are allowed", (file) =>
            file
              ? ["image/jpeg", "image/png", "image/webp"].includes(file.type)
              : false
          )
          .test("fileSize", "Each image must be less than 5MB", (file) =>
            file ? file.size <= 5 * 1024 * 1024 : false
          )
      )
      .min(2, "At least two images are required")
      .required("Images are required"),

    productFAQ: Yup.array()
      .of(
        Yup.object().shape({
          question: Yup.string().required("Question is required"),
          answer: Yup.string().required("Answer is required"),
        })
      )
      .min(1, "At least one FAQ is required"),

    selectedCountries: Yup.array()
      .of(
        Yup.string().required("Country is required")
      )
      .min(1, "At least one country must be selected")
      .required("Available countries are required"),
    countryVariants: Yup.object().test(
      "all-countries-have-variants",
      "Each country must have complete variant information",
      function(value) {
        const { selectedCountries } = this.parent;
        if (!selectedCountries || !value) {
          return this.createError({
            message: "Variants are required for selected countries"
          });
        }

        for (const countryId of selectedCountries) {
          const variants = value[countryId];
          
          // Check if variants exist for this country
          if (!variants || variants.length === 0) {
            return this.createError({
              message: `Please add at least one variant for selected country`
            });
          }

          // Check each variant's fields
          for (const variant of variants) {
            if (!variant.variantName?.trim()) {
              return this.createError({
                message: "Variant name is required"
              });
            }
            
            if (!variant.price || isNaN(Number(variant.price)) || Number(variant.price) < 0) {
              return this.createError({
                message: "Valid price is required for each variant"
              });
            }

            if (!variant.stock || isNaN(Number(variant.stock)) || Number(variant.stock) < 0) {
              return this.createError({
                message: "Valid stock quantity is required for each variant"
              });
            }
          }
        }

        return true;
      }
    ),
  });

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    touched,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
  } = useFormik({
    initialValues: {
      productName: "",
      productShortName: "",
      selectedCountries: [],
      productDiscount: "",
      productDescription: "",
      productBenefits: "",
      productRating: "",
      productUseCase: "",
      productImages: [],
      productIngredients: "",
      productOtherInfo: "",
      productFAQ: [
        {
          question: "",
          answer: "",
        },
      ],
      productCategory: [],
      badges: [],
      countryVariants: {},
    },
    validationSchema: productValidationSchema,
    onSubmit: (values, { resetForm, setSubmitting }) => {
      const processedData = {
        ...values,
        productBenefits: values.productBenefits
          .split("\n")
          .map((b) => b.trim())
          .filter((b) => b.length > 0),
        productUseCase: values.productUseCase
          .split("\n")
          .map((b) => b.trim())
          .filter((b) => b.length > 0),
        imageOrientations,
      };
      addProduct(processedData, navigate, resetForm, setSubmitting, imageRef);
    },
  });

  useEffect(() => {
    const badgeIds = selectedBadges.map((b) => b._id);
    setFieldValue("badges", badgeIds);
  }, [selectedBadges, setFieldValue]);

  const handleImageChange = (event) => {
    const newFiles = Array.from(event.target.files);
    if (!newFiles || newFiles.length === 0) return;

    const combinedFiles = [...productImages, ...newFiles];

    setProductImages(combinedFiles);
    setImageOrientations([
      ...imageOrientations,
      ...newFiles.map(() => "landscape"), // default orientation
    ]);
    setFieldValue("productImages", combinedFiles);
    // mark as touched so validation messages show up for files
    if (setFieldTouched) setFieldTouched("productImages", true);
  };

  // function to delete image from selected
  function deleteImage(id) {
    const newImages = productImages.filter((_, index) => index !== id);
    const newOrientations = imageOrientations.filter(
      (_, index) => index !== id
    );
    setProductImages(newImages);
    setImageOrientations(newOrientations);
    setFieldValue("productImages", newImages);
    values.productImages = newImages;
    if (newImages.length === 0 && imageRef.current) {
      imageRef.current.value = null;
    }
  }

  const handleCategoryChange = (selectedOptions) => {
    const selected = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setFieldValue("productCategory", selected);
  };

  const countryOptions = countries.map((country) => ({
    value: country._id,
    label: country.name,
  }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = productImages.findIndex(
        (_, i) => `img-${i}` === active.id
      );
      const newIndex = productImages.findIndex(
        (_, i) => `img-${i}` === over?.id
      );
      const reorderedImages = arrayMove(productImages, oldIndex, newIndex);
      const reorderedOrientations = arrayMove(
        imageOrientations,
        oldIndex,
        newIndex
      );
      setProductImages(reorderedImages);
      setImageOrientations(reorderedOrientations);
      setFieldValue("productImages", reorderedImages);
    }
  };

  // Set all image orientations to portrait (true) or landscape (false)
  const setAllOrientations = (toPortrait) => {
    if (productImages.length === 0) return;
    const newOrientation = toPortrait ? "portrait" : "landscape";
    const newOrientations = productImages.map(() => newOrientation);
    setImageOrientations(newOrientations);
  };

  const categoryOptions = categoryData.map((category) => ({
    value: category._id,
    label: category.categoryName,
  }));

  const offerType = [
    { label: "Limited Time", value: "limited-time" },
    { label: "Buy One Get One", value: "buy-one-get-one" },
    { label: "Exclusive", value: "exclusive" },
    { label: "Flash Sale", value: "flash-sale" },
    { label: "Bundle", value: "bundle" },
    { label: "Coupon Based", value: "coupon-based" },
    { label: "Category Based", value: "category-based" },
    { label: "Min Order Value", value: "min-order-value" },
  ];

  // find the offer type label
  const getOfferTypeLabel = (value) => {
    const match = offerType.find((type) => type.value === value);
    return match ? match.label : value;
  };

  // function to delete the offer
  async function deleteOfferItem(offerId) {
    const response = await deleteOffer(offerId);
    if (response) {
      setOffers((prev) => prev.filter((offer) => offer._id !== offerId));
      const stored = JSON.parse(localStorage.getItem("unsavedOffers")) || [];
      const updated = stored.filter((id) => id !== offerId);
      localStorage.setItem("unsavedOffers", JSON.stringify(updated));
    }
  }

  return (
    <div className="admin-add-product-main-container">
      <div className="admin-add-product-container">
        <AdminHeader title="Add Product" />
        <form className="admin-add-product-form" onSubmit={handleSubmit}>
          <div className="admin-add-product-form-group">
            <label htmlFor="productName">Product Name</label>
            <div className="admin-add-product-input-wrapper">
              <input
                type="text"
                className="admin-add-product-input"
                id="productName"
                name="productName"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.productName}
              />
              {errors?.productName && touched.productName && (
                <p className="error-message">{errors?.productName}</p>
              )}
            </div>
          </div>
          <div className="admin-add-product-form-group">
            <label htmlFor="productName">Short Name</label>
            <div className="admin-add-product-input-wrapper">
              <input
                type="text"
                className="admin-add-product-input"
                id="productShortName"
                name="productShortName"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.productShortName}
              />
              {errors?.productShortName && touched.productShortName && (
                <p className="error-message">{errors?.productShortName}</p>
              )}
            </div>
          </div>
          <div className="admin-add-product-form-group">
            <label>Select Countries</label>
            <Select
              isMulti
              options={countryOptions}
              value={countryOptions.filter((opt) =>
                values.selectedCountries.includes(opt.value)
              )}
              styles={customSelectStyles}
              onChange={(selected) => {
                const selectedIds = selected.map((opt) => opt.value);
                setFieldValue("selectedCountries", selectedIds);
                // mark touched so validation errors appear immediately
                if (setFieldTouched) setFieldTouched("selectedCountries", true);

                // Initialize variants if not present
                const updatedVariants = { ...values.countryVariants };
                selectedIds.forEach((id) => {
                  if (!updatedVariants[id]) {
                    updatedVariants[id] = [
                      { variantName: "", price: "", stock: "" },
                    ];
                  }
                });

                // Remove deselected countries
                Object.keys(updatedVariants).forEach((key) => {
                  if (!selectedIds.includes(key)) {
                    delete updatedVariants[key];
                  }
                });

                setFieldValue("countryVariants", updatedVariants);
                if (setFieldTouched) setFieldTouched("countryVariants", true);
              }}
              onBlur={() => {
                // mark touched so validation errors appear
                if (setFieldTouched) setFieldTouched("selectedCountries", true);
              }}
            />
            {errors?.selectedCountries && touched.selectedCountries && (
              <p className="error-message">{errors?.selectedCountries}</p>
            )}
          </div>
          {values.selectedCountries.map((countryId, index) => {
            const countryLabel =
              countryOptions.find((opt) => opt.value === countryId)?.label ||
              `Country ${index + 1}`;
            return (
              <div key={countryId} className="variant-section">
                <h4>Variants for {countryLabel}</h4>
                {values.countryVariants[countryId]?.map((variant, vIndex) => (
                  <div key={vIndex}>
                    <p style={{ fontSize: "14px" }}>Variant {index + 1}</p>
                    <div className="variant-row">
                      <input
                        type="text"
                        placeholder="Variant Name (e.g. 100ml)"
                        value={variant.variantName}
                        onChange={(e) => {
                          const updated = { ...values.countryVariants };
                          updated[countryId][vIndex].variantName =
                            e.target.value;
                          setFieldValue("countryVariants", updated);
                          if (setFieldTouched)
                            setFieldTouched("countryVariants", true);
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={variant.price}
                        onChange={(e) => {
                          const updated = { ...values.countryVariants };
                          updated[countryId][vIndex].price = e.target.value;
                          setFieldValue("countryVariants", updated);
                          if (setFieldTouched)
                            setFieldTouched("countryVariants", true);
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={variant.stock}
                        onChange={(e) => {
                          const updated = { ...values.countryVariants };
                          updated[countryId][vIndex].stock = e.target.value;
                          setFieldValue("countryVariants", updated);
                          if (setFieldTouched)
                            setFieldTouched("countryVariants", true);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...values.countryVariants };
                          updated[countryId].splice(vIndex, 1);
                          setFieldValue("countryVariants", updated);
                          if (setFieldTouched)
                            setFieldTouched("countryVariants", true);
                        }}
                      >
                        <IoClose size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {errors?.countryVariants && touched.countryVariants && (
                  <p className="error-message">
                    {(() => {
                      const countryVariants = values.countryVariants[countryId] || [];
                      const isCountryValid = countryVariants.length > 0 && 
                        countryVariants.every(variant => 
                          variant.variantName?.trim() &&
                          !isNaN(Number(variant.price)) &&
                          Number(variant.price) >= 0 &&
                          !isNaN(Number(variant.stock)) &&
                          Number(variant.stock) >= 0
                        );
                      return !isCountryValid ? "Please add at least one variant with valid name, price, and stock" : null;
                    })()}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...values.countryVariants };
                    updated[countryId].push({
                      variantName: "",
                      price: "",
                      stock: "",
                    });
                    setFieldValue("countryVariants", updated);
                    if (setFieldTouched)
                      setFieldTouched("countryVariants", true);
                  }}
                >
                  <FaPlus size={18} /> Add Variant
                </button>
              </div>
            );
          })}
          <div className="admin-add-product-form-group">
            <label htmlFor="product-price">Product Category</label>
            <div className="admin-add-product-input-wrapper">
              <Select
                id="productCategory"
                name="productCategory"
                options={categoryOptions}
                isMulti
                classNamePrefix="react-select"
                style={customSelectStyles}
                placeholder="Select categories..."
                onChange={handleCategoryChange}
                value={categoryOptions.filter((opt) =>
                  values.productCategory.includes(opt.value)
                )}
                onBlur={() => {
                  if (setFieldTouched) setFieldTouched("productCategory", true);
                }}
              />
              {errors?.productCategory && touched.productCategory && (
                <p className="error-message">{errors?.productCategory}</p>
              )}
            </div>
          </div>
          <div className="admin-add-product-form-group">
            <label htmlFor="product-price">
              Product Discount <sub>(in percentage %)</sub>{" "}
            </label>
            <div className="admin-add-product-input-wrapper">
              <input
                type="number"
                id="productDiscount"
                name="productDiscount"
                className="admin-add-product-input"
                onWheel={(e) => e.target.blur()}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.productDiscount}
              />
              {errors?.productDiscount && touched.productDiscount && (
                <p className="error-message">{errors?.productDiscount}</p>
              )}
            </div>
          </div>
          <div className="admin-add-product-form-group">
            <label htmlFor="product-description">Product Description</label>
            <div className="admin-add-product-input-wrapper">
              <textarea
                id="productDescription"
                name="productDescription"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.productDescription}
              ></textarea>
              {errors?.productDescription && touched.productDescription && (
                <p className="error-message">{errors?.productDescription}</p>
              )}
            </div>
          </div>
          <div className="admin-add-product-form-group">
            <label htmlFor="product-description">Benefits</label>
            <div className="admin-add-product-input-wrapper">
              <textarea
                id="productBenefits"
                name="productBenefits"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.productBenefits}
              ></textarea>
              {errors?.productBenefits && touched.productBenefits && (
                <p className="error-message">{errors?.productBenefits}</p>
              )}
            </div>
          </div>
          <div className="admin-add-product-form-group">
            <label htmlFor="product-price">Product Rating (optional)</label>
            <div className="admin-add-product-input-wrapper">
              <input
                type="number"
                id="productRating"
                name="productRating"
                className="admin-add-product-input"
                onWheel={(e) => e.target.blur()}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.productRating}
              />
              {errors?.productRating && touched.productRating && (
                <p className="error-message">{errors?.productRating}</p>
              )}
            </div>
          </div>
          <div className="admin-add-product-form-group">
            <label htmlFor="product-description">Product Use Case</label>
            <div className="admin-add-product-input-wrapper">
              <textarea
                id="productUseCase"
                name="productUseCase"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.productUseCase}
              ></textarea>
              {errors?.productUseCase && touched.productUseCase && (
                <p className="error-message">{errors?.productUseCase}</p>
              )}
            </div>
          </div>
          <div className="admin-add-product-form-group">
            <label htmlFor="product-price">Product Images</label>
            <div className="admin-add-product-input-wrapper">
              <div className="admin-add-product-input-custom-file">
                <input
                  type="file"
                  id="productImages"
                  name="productImages"
                  className="admin-add-product-input custom-file-input"
                  onChange={handleImageChange}
                  multiple
                  onBlur={handleBlur}
                  accept="image/*"
                  ref={imageRef}
                />
                <div className="admin-add-product-input-custom-file-btn">
                  <IoCloudUploadOutline />
                  <p>Upload Images</p>
                </div>
              </div>
              {errors?.productImages && touched.productImages && (
                <p className="error-message">{errors?.productImages}</p>
              )}
            </div>
          </div>
          {productImages.length > 0 && (
            <div className="admin-add-product-images-preview-container">
              <p>Product image preview</p>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={
                      imageOrientations.length > 0 &&
                      imageOrientations.every((o) => o === "portrait")
                    }
                    onChange={(e) => setAllOrientations(e.target.checked)}
                  />
                  <span>All Portrait</span>
                </label>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={productImages.map((_, index) => `img-${index}`)}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="admin-add-product-images-preview-section">
                    {productImages.map((image, index) => (
                      <SortableImage
                        key={`img-${index}`}
                        id={`img-${index}`}
                        image={image}
                        index={index}
                        onDelete={deleteImage}
                        imageOrientations={imageOrientations}
                        handleOrientationChange={(id, orientation) => {
                          const newOrientations = [...imageOrientations];
                          newOrientations[id] = orientation;
                          setImageOrientations(newOrientations);
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
          <BadgeSelector
            selectedBadges={selectedBadges}
            setSelectedBadges={setSelectedBadges}
          />
          <div className="admin-add-product-form-group">
            <label htmlFor="product-description">Product Ingredients</label>
            <div className="admin-add-product-input-wrapper">
              <textarea
                id="productIngredients"
                name="productIngredients"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.productIngredients}
              ></textarea>
              {errors?.productIngredients && touched.productIngredients && (
                <p className="error-message">{errors?.productIngredients}</p>
              )}
            </div>
          </div>
          <div className="admin-add-product-form-group">
            <div className="admin-add-product-faq-container">
              <label htmlFor="product-description">Product FAQ</label>
              <button
                type="button"
                onClick={() => {
                  setFieldValue("productFAQ", [
                    ...values.productFAQ,
                    { question: "", answer: "" },
                  ]);
                }}
              >
                Add
              </button>
            </div>

            {values.productFAQ.map((faq, index) => (
              <div className="admin-add-product-faq-section" key={index}>
                <div className="admin-add-product-faq-section-item">
                  <label
                    htmlFor={`productFAQ[${index}].question`}
                    className="admin-add-product-faq-section-item-label"
                  >
                    Question
                  </label>
                  <input
                    type="text"
                    name={`productFAQ[${index}].question`}
                    value={faq.question}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="admin-add-product-input"
                  />
                  {errors.productFAQ &&
                    errors.productFAQ[index]?.question &&
                    touched.productFAQ?.[index]?.question && (
                      <p className="error-message">
                        {errors.productFAQ[index].question}
                      </p>
                    )}
                </div>

                <div className="admin-add-product-faq-section-item">
                  <label
                    htmlFor={`productFAQ[${index}].answer`}
                    className="admin-add-product-faq-section-item-label"
                  >
                    Answer
                  </label>
                  <input
                    type="text"
                    name={`productFAQ[${index}].answer`}
                    value={faq.answer}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="admin-add-product-input"
                  />
                  {errors.productFAQ &&
                    errors.productFAQ[index]?.answer &&
                    touched.productFAQ?.[index]?.answer && (
                      <p className="error-message">
                        {errors.productFAQ[index].answer}
                      </p>
                    )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updatedFAQs = [...values.productFAQ];
                    updatedFAQs.splice(index, 1);
                    setFieldValue("productFAQ", updatedFAQs);
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
            {typeof errors.productFAQ === "string" && touched.productFAQ && (
              <p className="error-message">{errors.productFAQ}</p>
            )}
          </div>
          <div className="admin-add-product-form-group">
            <label htmlFor="product-description">
              Product Other Information
            </label>
            <div className="admin-add-product-input-wrapper">
              <textarea
                id="productOtherInfo"
                name="productOtherInfo"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.productOtherInfo}
              ></textarea>
              {errors?.productOtherInfo && touched.productOtherInfo && (
                <p className="error-message">{errors?.productOtherInfo}</p>
              )}
            </div>
          </div>
          <button type="submit" className="admin-add-product-submit-btn">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}
