import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import App from "../WelcomePage.jsx";
import Login from "../pages/Login";
import Chat from "../pages/Chat";

import PrivateRoute from "./PrivateRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";
import ProfileSetup from "../pages/ProfileSetup.jsx";
import UserProfile from "../pages/UserProfile.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={
          <PublicRoute>
            <App />
          </PublicRoute>
        }
      />

      <Route
        path="login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="profile-setup"
        element={
          <PrivateRoute>
            <ProfileSetup />
          </PrivateRoute>
        }
      />

      <Route
        path="user-profile/:userId"
        element={
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        }
      />

      <Route
        path="chat"
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }
      />
    </>,
  ),
);

export default router;
