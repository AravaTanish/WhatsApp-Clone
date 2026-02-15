import { Navigate } from "react-router-dom";
import useUserStore from "../store/userStore.js";
import Loading from "../components/LoadingScreen/Loading.jsx";

const PublicRoute = ({ children }) => {
  const { user, loading } = useUserStore();

  if (loading) {
    return <Loading message="Please wait..." />;
  }

  // Logged in and profile completed
  if (user && user.isCompleted) {
    return <Navigate to="/chat" replace />;
  }

  // Logged in but profile not completed
  if (user && !user.isCompleted) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

export default PublicRoute;
