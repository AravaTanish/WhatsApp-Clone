import { useEffect } from "react";
import useUserStore from "../store/userStore.js";
import api from "../api/axios.js";

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
    const fetchUser = async () => {
      try {
        const response = await api.get("login/me");
        if (response.data.success) {
          const { userId, id, email, isCompleted } = response.data;
          setUser({
            userId,
            id,
            email,
            isCompleted,
          });
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
