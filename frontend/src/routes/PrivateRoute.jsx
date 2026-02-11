import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import Loading from "../components/LoadingScreen/Loading";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setAuthStatus(false);
        return;
      }
      try {
        const response = await api.get("/login/me");

        if (response.data.success) {
          setAuthStatus(true);
        } else {
          setAuthStatus(false);
        }
      } catch {
        setAuthStatus(false);
      }
    };

    verifyUser();
  }, [token]);

  if (authStatus === null) {
    return <Loading message="Checking authentication..." />;
  }

  if (!authStatus) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
