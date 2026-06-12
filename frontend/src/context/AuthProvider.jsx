import { useEffect } from "react";
import useUserStore from "../store/userStore.js";
import api from "../api/axios.js";
import socket from "../socket/socket.js";

const AuthProvider = ({ children }) => {
  console.log("Running !");
  const { user, setUser, setLoading } = useUserStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

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
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  console.log("User changed:", user);
  useEffect(() => {
    console.log("Socket Effect Running");
    if (!user?.isCompleted) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const handleConnect = () => {
      console.log("EMIT addUser FROM CONNECT");
      socket.emit("addUser");
    };

    const handleConnectError = (err) => {
      console.log("Socket auth error:", err.message);
    };

    socket.auth = { token };

    socket.off("connect", handleConnect);
    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit("addUser");
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [user]);

  return children;
};

export default AuthProvider;
