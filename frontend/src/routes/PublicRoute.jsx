import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Loading from "../components/LoadingScreen/Loading.jsx";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const [isCompleted, setIsCompleted] = useState(null);

  useEffect(() => {
    const checkCompleted = async () => {
      if (!token) {
        setIsCompleted(false);
        return;
      }
      try {
        const response = await api.get("/login/me", {});
        if (response.data.success) {
          setIsCompleted(response.data.isCompleted);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
        setIsCompleted(false);
      }
    };

    checkCompleted();
  }, [token]);
  console.log(isCompleted);
  if (isCompleted === null) {
    return <Loading message={"Please wait..."} />;
  }
  if (token && isCompleted) {
    return <Navigate to="/chat" replace />;
  } else if (token && !isCompleted) {
    return <Navigate to="/profile-setup" replace />;
  }
  return children;
};

export default PublicRoute;
