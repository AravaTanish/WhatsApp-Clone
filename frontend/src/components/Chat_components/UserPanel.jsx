import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import Loading from "../LoadingScreen/Loading.jsx";
import api from "../../api/axios.js";
import useUserStore from "../../store/userStore.js";
import { useNavigate } from "react-router-dom";

export default function UserPanel({ mode, isOpen, onClose }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [allFriends, setAllFriends] = useState([]); // store original friends list
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user } = useUserStore();
  const currentUserId = user?.userId;

  // Close with ESC
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Reset when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setUsers([]);
      setAllFriends([]);
      setLoading(false);
    }
  }, [isOpen]);

  // Fetch friends when mode = friends
  useEffect(() => {
    if (!isOpen || mode !== "friends") return;

    async function fetchFriends() {
      try {
        setLoading(true);
        const res = await api.get("/friends/all-friends");
        const filtered = res.data.friends.filter(
          (u) => u.userId !== currentUserId,
        );
        setAllFriends(filtered);
        setUsers(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchFriends();
  }, [mode, isOpen, currentUserId]);

  // Search logic
  useEffect(() => {
    if (!search.trim()) {
      if (mode === "search") setUsers([]);
      if (mode === "friends") setUsers(allFriends);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        if (mode === "search") {
          const res = await api.get(`/search/users?search=${search}`);
          const filtered = res.data.users.filter(
            (u) => u.userId !== currentUserId,
          );
          setUsers(filtered);
        }
        if (mode === "friends") {
          const filtered = allFriends.filter((u) =>
            u.userId.toLowerCase().includes(search.toLowerCase()),
          );
          setUsers(filtered);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search, allFriends, currentUserId, mode]);

  function getTitle() {
    if (mode === "search") return "Search Users";
    if (mode === "friends") return "Your Friends";
    return "";
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 transition ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[#0f1c21] border-r border-[#1f2c33] z-50 
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1f2c33]">
          <h2 className="text-lg font-semibold text-white">{getTitle()}</h2>
          <FiX
            size={22}
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer"
          />
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#202c33] text-white px-4 py-2 rounded-full 
            focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Results */}
        <div className="px-4 overflow-y-auto">
          {loading && <Loading message="Loading..." />}

          {!loading && users.length === 0 && (
            <p className="text-center text-gray-400 mt-4">No users found</p>
          )}

          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => {
                navigate(`/user-profile/${user.userId}`);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg 
              hover:bg-[#202c33] cursor-pointer transition"
            >
              <img
                src={user.profilePicture?.url || "/default-avatar.png"}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-white font-medium">{user.userId}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
