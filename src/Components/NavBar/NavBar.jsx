import React, { useState, useEffect, useCallback, useRef } from "react";
import logo from "../../assets/images/logo.png";
import search from "../../assets/images/search.png";
import wishlist from "../../assets/images/wishlist.png";
import cart from "../../assets/images/shopping-bag.png";
import userProfile from "../../assets/images/people.png";
// import perfumeImg from "../../assets/images/perfume.png";
import login from "../../assets/images/login.png";
import signup from "../../assets/images/signup.png";
import { Link, Links, useNavigate } from "react-router-dom";
import "./NavBar.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  getUserSubCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../../services/userApiServices";
import { updateCart } from "../../redux/slices/userSlice";
import { logout } from "../../redux/slices/userSlice";
import {
  calculateCartSubtotal,
  calculateTotalPrice,
  getDiscountedPrice,
} from "../../utils/calculation";
import { fetchSuggestions } from "../../services/productApiServices";
import { useTypewriter } from "react-simple-typewriter";
import {
  faFacebookF,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { getSettingsData } from "../../services/settingsApiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NavBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const textArray = ["Perfumes", "Fragrance"];
  const drawerRef = useRef();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { token, user } = useSelector((state) => state.user);
  const [subCartData, setSubCartData] = useState([]);
  const selectedCountry = useSelector((state) => state?.user?.selectedCountry);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [socialLinks, setSocialLinks] = useState({});
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    // Initial measurement
    updateHeaderHeight();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  const fetchSubCartData = useCallback(async () => {
    if (isCartOpen && selectedCountry._id) {
      const response = await getUserSubCart(selectedCountry._id, user.id);

      if (response) {
        setSubCartData(response);
      }
    }
  }, [selectedCountry._id, isCartOpen, user?.id]);

  useEffect(() => {
    if (user && user.cart) {
      fetchSubCartData();
    }
  }, [user, fetchSubCartData, user?.cart]);

  useEffect(() => {
    getSettingsData(() => {}, setSocialLinks);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsCartOpen(false);
        setIsMenuOpen(false);
        setIsUserDropdownOpen(false);
      }
    };

    if (isCartOpen || isMenuOpen || isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isCartOpen,
    setIsCartOpen,
    isMenuOpen,
    setIsMenuOpen,
    setIsUserDropdownOpen,
    isUserDropdownOpen,
  ]);

  function getCountryPrice(product) {
    if (!selectedCountry || !selectedCountry._id) return 0;
    // Fallback to countryVariants
    if (product.countryVariants instanceof Map) {
      const variantList = product.countryVariants.get(selectedCountry._id);
      if (variantList && variantList[0]?.price != null) {
        return variantList[0].price;
      }
    } else if (typeof product.countryVariants === "object") {
      const variantList = product.countryVariants[selectedCountry._id];
      if (variantList && variantList[0]?.price != null) {
        return variantList[0].price;
      }
    }

    return 0;
  }

  const [text] = useTypewriter({
    words: textArray,
    loop: true,
    delaySpeed: 3000,
  });

  // function to remove item from cart
  async function removeItem(item) {
    const response = await removeCartItem(
      item?.productId?._id,
      selectedCountry?._id,
      false,
      token
    );

    if (response) {
      dispatch(updateCart({ cart: response?.cart }));
    }
  }
  // function to increment cart item quantity
  async function updateCartQuantity(
    productId,
    action,
    countryId
    // isShow = true
  ) {
    const response = await updateCartItemQuantity(productId, action, countryId);
    if (response) {
      dispatch(updateCart({ cart: response?.cart }));
    }
  }

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("remilletteTkn");
    navigate("/login");
  };

  async function addProductToCart(product) {
    if (!token) {
      navigate("/login");
      return;
    }
    const response = await addToCart(
      product?._id,
      1,
      selectedCountry._id,
      false
    );
    if (response) {
      dispatch(updateCart({ cart: response }));
    }
  }

  // product search section
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim()) {
        const response = await fetchSuggestions(query, selectedCountry._id);
        if (response) {
          setSuggestions(response);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, selectedCountry._id]);

  const handleSelect = (productId) => {
    navigate(`/${selectedCountry.code}/product-inner/${productId}`);
    setQuery("");
    setSuggestions([]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(
      `/${selectedCountry.code}/product-list?query=${encodeURIComponent(
        query
      )}&countryId=${selectedCountry._id}`
    );
    setQuery("");
  };

  useEffect(() => {
    if (isCartOpen || isMenuOpen) {
      // lock scroll
      document.body.style.overflow = "hidden";
    } else {
      // restore scroll
      document.body.style.overflow = "";
    }

    // cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen, isMenuOpen]);

  return (
    <>
      <div
        ref={headerRef}
        className={`header-sec ${isSticky ? " sticky" : ""}`}
      >
        <div className="wrapper">
          <div className="header-row">
            <div className="header-col1">
              <div className="logo">
                <p onClick={() => navigate(`/${selectedCountry.code}`)}>
                  <img src={logo} alt="logo" />
                </p>
              </div>
            </div>
            <div className="header-col2">
              <div className="header-menu">
                <ul>
                  <li>
                    <Link to={`/${selectedCountry.code}/`}>Home</Link>
                  </li>
                  <li>
                    <Link to={`/${selectedCountry.code}/about`}>About Us</Link>
                  </li>
                  <li>
                    <Link to={`/${selectedCountry.code}/product-list`}>
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link to={`/${selectedCountry.code}/contact`}>
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="header-col3">
              <div className="cart-sec">
                <div className="cart-menus">
                  <div className="cart-icons">
                    <form
                      role="search"
                      method="get"
                      className="search-form form"
                      onSubmit={handleSearch}
                    >
                      <button type="submit" className="search-submit button">
                        <img src={search} alt="Search" />
                      </button>
                      <input
                        type="text"
                        placeholder={`Search By ${text}`}
                        className="search-input"
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      {suggestions.length > 0 ? (
                        <ul className="suggestion-dropdown">
                          {suggestions.map((product) => (
                            <li
                              key={product._id}
                              onClick={() => handleSelect(product._id)}
                            >
                              <img
                                src={`${import.meta.env.VITE_BASE_URL}/${
                                  product.productImages[0].path
                                }`}
                                alt={product.productName}
                                width="30"
                              />
                              {product.productName}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        query.length > 0 && (
                          <div className="suggestion-dropdown">
                            <ul>
                              <li>No result found</li>
                            </ul>
                          </div>
                        )
                      )}
                    </form>
                    <div className="user-dropdown-wrapper">
                      <img
                        src={userProfile}
                        alt="User"
                        className="user-icon"
                        onClick={() => {
                          setIsUserDropdownOpen((prev) => !prev);
                        }}
                      />
                      {!token && isUserDropdownOpen && (
                        <div ref={drawerRef} className="user-dropdown">
                          <Link
                            to="/login"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="user-dropdown-item"
                          >
                            <span>
                              <img src={login} alt="" />
                            </span>{" "}
                            Login
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="user-dropdown-item"
                          >
                            <span>
                              <img src={signup} alt="" />
                            </span>{" "}
                            Signup
                          </Link>
                        </div>
                      )}
                      {token && isUserDropdownOpen && (
                        <div ref={drawerRef} className="user-dropdown">
                          <Link
                            to={`/${selectedCountry.code}/profile/details`}
                            className="user-dropdown-item"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            {/* <span>
                              <img src={login} alt="" />
                            </span>{" "} */}
                            Profile
                          </Link>
                          <Link
                            to={`/${selectedCountry.code}/profile/orders`}
                            className="user-dropdown-item"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            {/* <span>
                              <img src={login} alt="" />
                            </span>{" "} */}
                            Orders
                          </Link>
                          <Link
                            to="#"
                            className="user-dropdown-item"
                            onClick={(e) => {
                              e.preventDefault();
                              handleLogout();
                              setIsUserDropdownOpen(false);
                            }}
                          >
                            {/* <span>
                              <img src={signup} alt="" />
                            </span>{" "} */}
                            Log out
                          </Link>
                        </div>
                      )}
                    </div>
                    <div
                      className="cart-icon"
                      role="button"
                      onClick={() => {
                        navigate(`/${selectedCountry.code}/profile/wishlist`);

                        setTimeout(() => {
                          const el =
                            document.getElementById("wishlist-section");
                          if (el) {
                            const headerOffset = 100;
                            const elementPosition =
                              el.getBoundingClientRect().top +
                              window.pageYOffset;
                            const offsetPosition =
                              elementPosition - headerOffset;

                            window.scrollTo({
                              top: offsetPosition,
                              behavior: "smooth",
                            });
                          }
                        }, 200);
                      }}
                    >
                      <img src={wishlist} alt="Wishlist" />
                      <div className="cart-items">
                        {(user && user?.wishlist?.length) || 0}
                      </div>
                    </div>

                    <div
                      className="cart-icon"
                      onClick={() => setIsCartOpen(true)}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={cart} alt="Cart" />
                      <div className="cart-items">
                        {(user && user.cart && user.cart.items.length) || 0}
                      </div>
                    </div>
                    <button
                      className="hamburger"
                      onClick={() => setIsMenuOpen(true)}
                    >
                      ☰
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <form
              role="search"
              method="get"
              className="search-form form mobilemenu"
              onSubmit={handleSearch}
            >
              <button type="button" className="search-submit button">
                <img src={search} alt="Search" onClick={handleSearch} />
              </button>
              <input
                type="text"
                placeholder={`Search By ${text}`}
                className="search-input"
                onChange={(e) => setQuery(e.target.value)}
              />
              {suggestions.length > 0 ? (
                <ul className="suggestion-dropdown">
                  {suggestions.map((product) => (
                    <li
                      key={product._id}
                      onClick={() => handleSelect(product._id)}
                    >
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}/${
                          product.productImages[0].path
                        }`}
                        alt={product.productName}
                        width="30"
                      />
                      {product.productName}
                    </li>
                  ))}
                </ul>
              ) : (
                query.length > 0 && (
                  <div className="suggestion-dropdown">
                    <ul>
                      <li>No result found</li>
                    </ul>
                  </div>
                )
              )}
            </form>
          </div>
        </div>
      </div>
      {isSticky && <div style={{ height: `${headerHeight}px` }}></div>}

      <div
        ref={drawerRef}
        className={`mobile-menu-panel ${isMenuOpen ? "open" : ""}`}
      >
        <div className="mobile-menu-header">
          <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
            ×
          </button>
        </div>
        <ul className="mobile-menu-list">
          <li>
            <Link to={`/${selectedCountry.code}/`}>HOME</Link>
          </li>
          <li>
            {" "}
            <Link to={`/${selectedCountry.code}/product-list`}>PRODUCTS</Link>
          </li>
          <li>
            {" "}
            <Link to={`/${selectedCountry.code}/About`}>ABOUT US</Link>
          </li>
          <li>
            <Link to={`/${selectedCountry.code}/contact`}>CONTACT</Link>
          </li>
        </ul>
        <div className="mobile-menu-footer">
          <button className="login-btn">
            <img src={user} alt="user" />
            Login
          </button>
          <div className="social-icons">
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="overlay" onClick={() => setIsMenuOpen(false)} />
      )}
      <div
        ref={drawerRef}
        className={`shopping-drawer ${isCartOpen ? "active" : ""}`}
      >
        <div className="offer-panel">
          <div className="offer-header"></div>
          {Array.isArray(subCartData) && subCartData.length > 0 ? (
            subCartData.map((p) => (
              <div className="offer-product" key={p._id}>
                <img
                  src={`${import.meta.env.VITE_BASE_URL}/${
                    p.productImages[0].path
                  }`}
                  alt={p.productName}
                  onClick={() => {
                    navigate(`/${selectedCountry.code}/product-inner/${p._id}`);
                    setIsCartOpen(false);
                  }}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <h4>{p.productName}</h4>
                  <p>
                    {selectedCountry.priceLabel}
                    {getDiscountedPrice(
                      getCountryPrice(p),
                      p.productDiscount
                    ).toFixed(2)}
                    <span className="old-price">
                      {selectedCountry.priceLabel}
                      {getCountryPrice(p).toFixed(2)}
                    </span>
                  </p>
                  <button onClick={() => addProductToCart(p)}>
                    ADD TO CART →
                  </button>
                </div>
              </div>
            ))
          ) : subCartData === null ? (
            <div>Loading...</div> // or a spinner
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              No products to display.
            </div>
          )}
        </div>
        <div className="cart-panel">
        <div className="cart-inner">
          <div className="cart-header">
            <h2>CART</h2>
            <p className="free-gift-text"></p>
            <button onClick={() => setIsCartOpen(false)}>✖</button>
          </div>
          <div className="cart-items-list">
            {user &&
              user.cart &&
              user.cart.items.map((item, index) => (
                <div className="cart-item" key={index}>
                  {item.productId && (
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}/${
                        item.productId.productImages[0].path
                      }`}
                      style={{ cursor: "pointer" }}
                      alt={item.name}
                      onClick={() => {
                        navigate(
                          `/${selectedCountry.code}/product-inner/${item.productId._id}`
                        );
                        setIsCartOpen(false);
                      }}
                    />
                  )}
                  <div className="item-details">
                    <h4>{item.productId && item.productId.productName}</h4>
                    <div className="quantity">
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.productId._id,
                            "decrement",
                            selectedCountry?._id
                          )
                        }
                      >
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.productId._id,
                            "increment",
                            selectedCountry?._id
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="item-price" style={{ display: "none" }}>
                    {selectedCountry.priceLabel}
                    {((item && item?.productId?.productPrice) || 0).toFixed(1)}
                    /Item
                  </div>
                  {/* <div className="item-price">
                    {selectedCountry.priceLabel}
                    {calculateTotalPrice(
                      item?.productId?.countryPrices.find(
                        (country) => country.country._id === selectedCountry._id
                      )?.price,
                      item?.productId?.productDiscount,
                      item.qty
                    ).toFixed(2)}
                  </div> */}
                  <div className="item-price">
                    {selectedCountry.priceLabel}
                    {calculateTotalPrice(
                      item?.productId?.countryVariants?.[
                        selectedCountry._id
                      ]?.[0]?.price || 0,
                      item?.productId?.productDiscount || 0,
                      item.qty
                    ).toFixed(2)}
                  </div>
                  <button onClick={() => removeItem(item)}>✖</button>
                </div>
              ))}
          </div>
          </div>
          <div className="cart-footer">
            {user && user.cart && user.cart.items.length > 0 ? (
              <>
                <p>Tax included. Shipping calculated at checkout.</p>
                <button
                  className="checkout-btn"
                  onClick={() => {
                    navigate(`/${selectedCountry.code}/checkout`);
                    setIsCartOpen(false);
                  }}
                >
                  CHECKOUT — {selectedCountry.priceLabel}
                  {calculateCartSubtotal(
                    user.cart.items,
                    selectedCountry?._id
                  ).toFixed(2)}
                </button>
              </>
            ) : (
              <div className="empty-cart">
                <p> No cart items available </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {(isCartOpen || isMenuOpen) && (
        <div
          className="overlay"
          onClick={() => {
            setIsCartOpen(false);
            setIsMenuOpen(false);
          }}
        />
      )}
    </>
  );
}
