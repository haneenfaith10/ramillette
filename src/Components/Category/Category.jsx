import { useEffect, useState } from "react";
import "./Category.css";
import { getActiveCategories } from "../../services/categoryApiServices";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Category() {
  const [category, setCategory] = useState([]);
  const selectedCountry = useSelector((state) => state.user.selectedCountry);
  const navigate = useNavigate();

  useEffect(() => {
    getActiveCategories(setCategory);
  }, []);

  return (
    <div className="category-wrapper">
      <div className="category-cards">
        {category &&
          category.length > 0 &&
          category.map((category, index) => (
            <div key={index} className="cate-cards">
              <div className="cate-cards-image">
                <img
                  src={`${import.meta.env.VITE_BASE_URL}/${
                    category.categoryImage
                  }`}
                  alt="category image"
                />
              </div>
              <div className="cate-content">
                <h3>{category.categoryName}</h3>
                <button
                  className="secondry-btn"
                  onClick={() =>
                    navigate(
                      `/${selectedCountry.code}/product-list?category=${category._id}`
                    )
                  }
                >
                  Shop Now
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
