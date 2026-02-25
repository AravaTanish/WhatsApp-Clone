import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import Loading from "../LoadingScreen/Loading.jsx";
import api from "../../api/axios.js";
import UserProfile from "./UserProfile.jsx";
import useUserStore from "../../store/userStore.js";

export default function AddFriendPanel({ isOpen, onClose }) {
  const [search, setSearch] = useState("");
  let [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const { userId } = useUserStore().user;

  users = users.filter(function (item) {
    return item.userId !== userId;
  });

  // Close when ESC pressed
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Reset when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setUsers([]);
      setLoading(false);
    }
  }, [isOpen]);

  // Debounced Search Effect
  useEffect(() => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await api.get(`/search/users?search=${search}`);
        setUsers(response.data.users);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[#0f1c21] border-r border-[#1f2c33] z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1f2c33]">
          <h2 className="text-lg font-semibold text-white">Search</h2>
          <FiX
            size={22}
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer"
          />
        </div>

        {/* Search Input */}
        <div className="px-6 py-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-[#202c33] text-white px-4 py-2 rounded-full 
            focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Results */}
        <div className="px-4 overflow-y-auto">
          {loading && <Loading message={"Searching..."} />}

          {!loading && users.length === 0 && search && (
            <p className="text-center text-gray-400 mt-4">No users found</p>
          )}

          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                setOpenProfile(true);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg 
              hover:bg-[#202c33] cursor-pointer transition"
            >
              <img
                src={user.profilePicture.url || "/default-avatar.png"}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover"
              />

              <span className="text-white font-medium">{user.userId}</span>
            </div>
          ))}
        </div>
      </div>

      <UserProfile
        isOpen={openProfile}
        onClose={() => setOpenProfile(false)}
        user={selectedUser}
        friendshipStatus="none"
      />
    </>
  );
}
