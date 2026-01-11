import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

export default function UserAuthMiddleware({ children }) {
  const token = localStorage.getItem("remilletteTkn");
  // const location = useLocation().pathname;
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (location) {
  //     return navigate("/login");
  //   }
  // }, [navigate, location]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
