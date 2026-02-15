import { Navigate } from "react-router-dom";
import useUserStore from "../store/userStore.js";
import Loading from "../components/LoadingScreen/Loading.jsx";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useUserStore();

  // Still checking auth
  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
