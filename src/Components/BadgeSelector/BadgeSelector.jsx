import { useEffect, useState } from "react";
import { getAllBadges } from "../../services/badgeApiServices";
import "./BadgeSelector.css";

export function BadgeSelector({ selectedBadges = [], setSelectedBadges }) {
  const [badges, setBadges] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const adminToken = localStorage.getItem("remilletAdminTkn");



  useEffect(() => {
    getAllBadges(setBadges,adminToken);
  }, [adminToken]);

  const handleRemove = (badgeId) => {
    setSelectedBadges(selectedBadgeObjects.filter((b) => b._id !== badgeId));
  };
  const selectedBadgeObjects = selectedBadges
    .map((badge) => {
      if (typeof badge === "string") {
        return badges.find((b) => b._id === badge); // match by ID
      }
      return badge;
    })
    .filter(Boolean);

  const availableBadges = badges.filter(
    (badge) => !selectedBadgeObjects.some((b) => b._id === badge._id)
  );
  const handleSelect = (badge) => {
    setSelectedBadges([...selectedBadgeObjects, badge]);
  };

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
