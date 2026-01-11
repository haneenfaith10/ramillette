import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import "./AdminProductEdit.css";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import { IoClose, IoCloudUploadOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { getActiveCategories } from "../../services/categoryApiServices";
import { getActiveCountries } from "../../services/configApiService";
import Select from "react-select";
import { updateProduct } from "../../services/productApiServices";
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
import { BadgeSelector } from "../../Components/BadgeSelector/BadgeSelector";
import OfferSection from "../../Components/OfferSection/OfferSection";
import { deleteOffer } from "../../services/offerApiService";
import { FaPlus } from "react-icons/fa";

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

      <img
        src={
          typeof image === "string"
            ? image.startsWith("http") || image.startsWith("data")
              ? image
              : `${import.meta.env.VITE_BASE_URL}/${image}` // or use your base URL
            : image instanceof File
            ? URL.createObjectURL(image)
            : `${import.meta.env.VITE_BASE_URL}/${image}` || image
        }
        alt={`product-image-${index}`}
      />

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
        />
        Portrait
      </label>
    </div>
  );
};

export default function AdminProductEdit() {
  const imageRef = useRef(null);
  const location = useLocation();
  const { product } = location.state || {};
  const navigate = useNavigate();
  const [productImages, setProductImages] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [countries, setCountries] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor));
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
      .nullable()
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
    // productImages: Yup.array()
    //   .of(
    //     Yup.mixed().test("isValidType", "Invalid image format", (value) => {
    //       if (typeof value === "string") return true;
    //       if (value instanceof File) {
    //         return ["image/jpeg", "image/png", "image/webp"].includes(
    //           value.type
    //         );
    //       }
    //       return false;
    //     })
    //   )
    //   .min(2, "At least two images are required")
    //   .max(5, "A maximum of 5 images is allowed")
    //   .required("Images are required"),
    productImages: Yup.array()
      .of(
        Yup.mixed()
          .test("fileRequired", "Image is required", (file) => {
            // Handle string paths (existing images)
            if (typeof file === "string" && file.trim() !== "") return true;
            // Handle File objects (new uploads)
            if (file instanceof File) return true;
            return false;
          })
          .test("fileType", "Only image files are allowed", (file) => {
            // Skip type check for existing image paths
            if (typeof file === "string") return true;
            // Check file type for new File objects
            return (
              file &&
              ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
                file.type
              )
            );
          })
          .test("fileSize", "Each image must be less than 5MB", (file) => {
            // Skip size check for existing image paths
            if (typeof file === "string") return true;
            // Check file size for new File objects
            return file && file.size <= 5 * 1024 * 1024;
          })
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
        Yup.string()
          .required("Country is required")
          .matches(/^[a-f\d]{24}$/i, "Invalid country ID")
      )
      .min(1, "At least one country must be selected")
      .required("Available countries are required"),
  });

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    touched,
    handleSubmit,
    setFieldValue,
    setFieldError,
    isSubmitting,
  } = useFormik({
    initialValues: {
      productName: "",
      productShortName: "",
      selectedCountries: [],
      // countryPrices: {},
      productDiscount: "",
      productDescription: "",
      // productStock: "",
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
      productCategory: "",
      featureBadges: [],
      countryVariants: {},
    },
    validationSchema: productValidationSchema,
    onSubmit: (values, { setSubmitting }) => {
      const formData = new FormData();
      formData.append("productName", values.productName);
      formData.append("productShortName", values.productShortName);
      // formData.append("productStock", values.productStock);
      formData.append("productDiscount", values.productDiscount);
      formData.append("productDescription", values.productDescription);
      formData.append("productRating", values.productRating);
      formData.append("productOtherInfo", values.productOtherInfo);
      formData.append("productBenefits", values.productBenefits); // Join if needed
      formData.append("productUseCase", values.productUseCase);
      formData.append("productIngredients", values.productIngredients);

      // Country Prices (object)
      // formData.append("countryPrices", JSON.stringify(values.countryPrices));

      // FAQs
      formData.append("productFAQ", JSON.stringify(values.productFAQ));
      formData.append("featureBadges", JSON.stringify(values.featureBadges));

      formData.append(
        "productCategory",
        JSON.stringify(values.productCategory)
      );
      // Selected countries
      formData.append(
        "selectedCountries",
        JSON.stringify(values.selectedCountries)
      );

      // Handle image logic with orientations
      values.productImages.forEach((img, index) => {
        if (typeof img === "string") {
          // Existing image (path)
          formData.append("existingImages", img);
          formData.append(
            "existingImageOrientations",
            imageOrientations[index] || "landscape"
          );
        } else {
          // New uploaded image
          formData.append("newImages", img);
          formData.append(
            "newImageOrientations",
            imageOrientations[index] || "landscape"
          );
        }
      });
      formData.append(
        "countryVariants",
        JSON.stringify(values.countryVariants)
      );
      updateProduct(
        product?._id,
        formData,
        setSubmitting,
        setProductImages,
        navigate
      );
    },
  });
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    const updatedImages = [...productImages, ...files];
    const newOrientations = files.map(() => "landscape"); // default orientation for new images
    setProductImages(updatedImages);
    setImageOrientations([...imageOrientations, ...newOrientations]);
    setFieldValue("productImages", updatedImages);
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
  }

  useEffect(() => {
    if (product) {
      setFieldValue("productName", product.productName);
      setFieldValue("productShortName", product.productShortName);
      // setFieldValue("productPrice", product.productPrice);
      setFieldValue("productDiscount", product.productDiscount);
      setFieldValue("productDescription", product.productDescription);
      // setFieldValue("productStock", product.productStock);
      setFieldValue(
        "productBenefits",
        Array.isArray(product.productBenefits)
          ? product.productBenefits.join("\n")
          : product.productBenefits
      );
      setFieldValue("productRating", product.productRating);
      setFieldValue(
        "productUseCase",
        Array.isArray(product.productUseCase)
          ? product.productUseCase.join("\n")
          : product.productUseCase
      );
      setFieldValue("productIngredients", product.productIngredients);
      setFieldValue("productOtherInfo", product.productOtherInfo);
      const productImages = product.productImages.map((img) => img.path);
      setFieldValue("productImages", productImages);
      setFieldValue("productFAQ", product.productFAQ);
      setFieldValue("countryVariants", product.countryVariants);
      setProductImages(productImages); // Use the mapped paths instead of original objects
      setFieldValue("featureBadges", product.featureBadges);

      // Initialize orientations for existing images
      const existingOrientations = product.productImages.map(
        (img) => img.orientation || "landscape"
      );
      setImageOrientations(existingOrientations);
    }
  }, [product, setFieldValue]);

  useEffect(() => {
    if (product?.productCategory?.length > 0 && categoryData?.length > 0) {
      const matchedCategoryIds = product.productCategory
        .map((catObj) => {
          const match = categoryData.find(
            (cat) => cat.categoryName === catObj.categoryName
          );
          return match?._id;
        })
        .filter(Boolean); // remove undefined if no match

      setFieldValue("productCategory", matchedCategoryIds);
    }
    if (product?.countries?.length > 0) {
      const selectedCountryIds = product.countries.map((country) =>
        typeof country === "string" ? country : country._id
      );
      setFieldValue("selectedCountries", selectedCountryIds);
    }
  }, [product, categoryData, setFieldValue]);

  // Handler for react-select
  const handleCountryChange = (selectedOptions) => {
    const selected = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];

    setFieldValue("selectedCountries", selected);
  };

  const countryOptions = countries.map((country) => ({
    value: country._id,
    label: country.name,
  }));

  const categoryOptions = categoryData.map((category) => ({
    value: category._id,
    label: category.categoryName,
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

  const handleCategoryChange = (selectedOptions) => {
    const selected = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setFieldValue("productCategory", selected);
  };

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

  // function to delete the offers
  async function deleteOfferItem(offerId) {
    const offerToDelete = offers.find((offer) => offer._id === offerId);

    if (!offerToDelete) return;
    if (!offerToDelete.isExisting) {
      const response = await deleteOffer(offerId);
      if (response) {
        setOffers((prev) => prev.filter((offer) => offer._id !== offerId));
        const stored = JSON.parse(localStorage.getItem("unsavedOffers")) || [];
        const updated = stored.filter((id) => id !== offerId);
        localStorage.setItem("unsavedOffers", JSON.stringify(updated));
      }
    } else {
      setOffers((prev) => prev.filter((offer) => offer._id !== offerId));
    }
  }

  return (
    <div className="admin-edit-product-main-container">
      <div className="admin-edit-product-container">
        <AdminHeader title="Edit Product" />
        <form className="admin-edit-product-form" onSubmit={handleSubmit}>
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
            <label htmlFor="selectedCountries">Available In Countries</label>
            <div className="admin-add-product-input-wrapper">
              <Select
                id="selectedCountries"
                name="selectedCountries"
                options={countryOptions}
                isMulti
                value={countryOptions.filter((opt) =>
                  values.selectedCountries.includes(opt.value)
                )}
                onChange={handleCountryChange}
                classNamePrefix="react-select"
                styles={customSelectStyles}
                placeholder="Select countries..."
              />
              {errors.selectedCountries && touched.selectedCountries && (
                <p className="error-message">{errors.selectedCountries}</p>
              )}
            </div>
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
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...values.countryVariants };
                          updated[countryId].splice(vIndex, 1);
                          setFieldValue("countryVariants", updated);
                        }}
                      >
                        <IoClose size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...values.countryVariants };
                    if (!updated[countryId]) {
                      updated[countryId] = [];
                    }

                    updated[countryId].push({
                      variantName: "",
                      price: "",
                      stock: "",
                    });

                    setFieldValue("countryVariants", updated);
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
              />
              {errors?.productPrice && touched.productPrice && (
                <p className="error-message">{errors?.productPrice}</p>
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
            selectedBadges={values.featureBadges}
            setSelectedBadges={(badges) =>
              setFieldValue("featureBadges", badges)
            }
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
          <button
            type="submit"
            // disabled={isSubmitting}
            className="admin-add-product-submit-btn"
          >
            Update Product
          </button>
        </form>
      </div>
    </div>
  );
}
