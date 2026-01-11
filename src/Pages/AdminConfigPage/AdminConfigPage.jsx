import { Link } from "react-router-dom";
import "./AdminConfigPage.css"; // for styling the cards

export default function AdminConfigPage() {
  const configItems = [
    { name: "Manage Countries", path: "/admin/config/countries" },
    { name: "Manage Tax", path: "/admin/config/tax" },
    { name: "Manage Social Links", path: "/admin/config/social-links" },
    { name: "Shipping Provider", path: "/admin/config/shipping-provider" },
    { name: "Collection Alerts", path: "/admin/config/collection-alerts" },
  ];

  return (
    <div className="config-page">
      <h2>Configuration Settings</h2>
      <div className="config-cards">
        {configItems.map((item, index) => (
          <Link to={item.path} className="config-card" key={index}>
            <h3>{item.name}</h3>
            <p>Click to view and manage {item.name.toLowerCase()}.</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
