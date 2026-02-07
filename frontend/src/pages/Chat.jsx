import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const logout = async () => {
  try {
    const response = await api.get("/logout");
    if (response.data.success) {
      toast.success(response.data.message);
    }
  } catch (error) {
    console.error("Logout error", error);
    toast.error(error.response.data.message);
  } finally {
    localStorage.removeItem("token");
  }
};

function Chat() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Chat Page</h1>
      <button
        className="text-white rounded-lg bg-blue-500 py-2 px-4 m-2"
        onClick={async () => {
          await logout();
          navigate("/login");
        }}
      >
        Log Out
      </button>
    </div>
  );
}

export default Chat;
