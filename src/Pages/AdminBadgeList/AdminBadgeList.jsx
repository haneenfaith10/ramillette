import { useEffect, useState } from "react";
import { deleteBadge, getAllBadges } from "../../services/badgeApiServices";
import "./AdminBadgeList.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AdminBadgeList() {
  const [badges, setBadges] = useState([]);
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = useState(false);
  const adminToken = localStorage.getItem("remilletAdminTkn");

  useEffect(() => {
    getAllBadges(setBadges,adminToken);
  }, [adminToken]);

  const handleEdit = (badgeId) => {
    navigate(`/admin/edit-badge/${badgeId}`);
  };

  const handleDelete = (badgeId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete the badge!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteBadge(badgeId, setSubmitting);
        if (response) {
          Swal.fire({
            title: "Deleted!",
            text: "The Badge has been deleted.",
            icon: "success",
          });
          setBadges(response.badges);
        }
      }
    });
  };

  return (
    <div className="admin-badge-wrapper">
      <div className="admin-badge-header">
        <h2>Feature Badges</h2>
        <p>
          These badges are used to highlight product features on the user side.
        </p>
      </div>

      <div className="admin-badge-grid">
        {badges.length === 0 ? (
          <div className="no-badges">No badges available.</div>
        ) : (
          badges.map((badge) => (
            <div className="badge-card" key={badge._id}>
              <div className="badge-icon-wrapper">
                <img
                  src={`${import.meta.env.VITE_BASE_URL}${badge.iconUrl}`}
                  alt={badge.label}
                  className="badge-icon"
                />
              </div>
              <div className="badge-info">
                <span className="badge-label">{badge.label}</span>
              </div>
              <div className="badge-actions">
                <FaEdit
                  className="action-icon edit-icon"
                  onClick={() => handleEdit(badge._id)}
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDelete(badge._id)}
                >
                  <FaTrash className="action-icon delete-icon" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
