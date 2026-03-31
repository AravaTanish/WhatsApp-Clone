import { useEffect } from "react";
import useUserStore from "../store/userStore.js";
import api from "../api/axios.js";
import socket from "../socket/socket.js";

const AuthProvider = ({ children }) => {
  const setUser = useUserStore((state) => state.setUser);
  const setLoading = useUserStore((state) => state.setLoading);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const handleConnect = () => {
      socket.emit("addUser");
    };

    const handleConnectError = (err) => {
      console.log("Socket auth error:", err.message);
    };

    const fetchUser = async () => {
      try {
        const response = await api.get("login/me");
        if (response.data.success) {
          const { userId, id, email, isCompleted, profilePicture } =
            response.data;
          setUser({
            userId,
            id,
            email,
            isCompleted,
            profilePicture,
          });

          socket.auth = { token };

          socket.off("connect", handleConnect);
          socket.on("connect", handleConnect);
          socket.on("connect_error", handleConnectError);

          if (!socket.connected) {
            socket.connect();
          } else {
            socket.emit("addUser");
          }
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setUser, setLoading]);

  return children;
};

export default AuthProvider;
