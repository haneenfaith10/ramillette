import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminAuthMiddleware({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("remilletAdminTkn");

    if (!token && location.pathname !== "/admin/login") {
      navigate("/admin/login");
    }

    if (token && location.pathname === "/admin/login") {
      navigate("/admin/dashboard");
    }
  }, [location.pathname, navigate]); 

  return <>{children}</>;
}
