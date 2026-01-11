import { Outlet } from "react-router-dom";
import "./AdminMainLayout.css";
import AdminSideBar from "../../Components/AdminSideBar/AdminSideBar";

export default function AdminMainLayout() {
  return (
    <div className="admin-main-layout-container">
      {/* side bar section */}
      <div className="admin-main-layout-sidebar">
        <AdminSideBar />
      </div>
      {/* main content section */}
      <div className="admin-main-layout-content">
        <Outlet />
      </div>
    </div>
  );
}
