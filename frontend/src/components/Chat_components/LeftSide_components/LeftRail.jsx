import { useState, useEffect, useRef } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { MdGroups } from "react-icons/md";
import { FiPhone, FiSettings, FiLogOut } from "react-icons/fi";
import { TiUserAdd } from "react-icons/ti";
import { FaUserFriends } from "react-icons/fa";
import { MdOutlinePendingActions } from "react-icons/md";
import { LuMessageCircleDashed } from "react-icons/lu";
import UserPanel from "./UserPanel.jsx";
import PendingRequestsPanel from "./PendingRequestPanel.jsx";
import useChatStore from "../../../store/chatStore.js";
import useUserStore from "../../../store/userStore.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios.js";
import socket from "../../../socket/socket.js";

export default function LeftRail() {
  const { panelMode, setPanelMode, pendingOpen, setPendingOpen } =
    useChatStore();
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await api.get("/logout");
      if (response.data.success) {
        toast.success(response.data.message);
        setShowSettingsMenu(false);
        socket.disconnect();
        localStorage.removeItem("token");
        sessionStorage.clear();
        clearUser();
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error", error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div
      className="flex w-16 flex-col justify-between
    bg-linear-to-b from-[#0f1c21] to-[#0b141a]
    border-r border-[#1f2c33] py-6"
    >
      {/* TOP SECTION */}
      <div className="flex flex-col items-center gap-8">
        {/* Active Chat Icon */}
        <div className="flex items-center group cursor-pointer">
          <IoChatbubbleEllipsesOutline size={26} className="text-[#22c55e]" />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Chats
          </span>
        </div>

        {/* Groups */}
        <div className="flex items-center group cursor-pointer text-gray-400 hover:text-white transition">
          <MdGroups size={24} />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Groups
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center group cursor-pointer text-gray-400 hover:text-white transition">
          <LuMessageCircleDashed size={24} />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Status
          </span>
        </div>

        {/* Calls */}
        <div className="flex items-center group cursor-pointer text-gray-400 hover:text-white transition">
          <FiPhone size={22} />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Calls
          </span>
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-[#1f2c33]" />

        {/* Add Friends */}
        <div className="flex items-center group cursor-pointer text-gray-400 hover:text-white transition">
          <TiUserAdd size={24} onClick={() => setPanelMode("search")} />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Add Friends
          </span>
        </div>

        {/* All Friends */}
        <div className="flex items-center group cursor-pointer text-gray-400 hover:text-white transition">
          <FaUserFriends size={24} onClick={() => setPanelMode("friends")} />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Your Friends
          </span>
        </div>

        {/* Pending Requests */}
        <div className="flex items-center group cursor-pointer text-gray-400 hover:text-white transition">
          <MdOutlinePendingActions
            size={24}
            onClick={() => setPendingOpen(true)}
          />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Pending Requests
          </span>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="flex flex-col items-center gap-6">
        {/* Divider */}
        <div className="w-8 h-px bg-[#1f2c33]" />

        {/* Settings */}
        <div
          ref={menuRef}
          className="flex items-center group cursor-pointer text-gray-400 hover:text-white transition"
        >
          <FiSettings
            size={22}
            onClick={() => setShowSettingsMenu((prev) => !prev)}
            className="text-gray-400 hover:text-white cursor-pointer transition"
          />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Settings
          </span>

          {showSettingsMenu && (
            <div className="absolute bottom-14 left-14 w-44 bg-[#202c33] border border-[#2a3942] rounded-xl shadow-xl z-50 overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#2a3942] transition"
              >
                <FiLogOut
                  size={20}
                  className="text-red-500 hover:text-red-600"
                />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center group cursor-pointer text-gray-400 hover:text-white transition">
          <img
            src={user.profilePicture || import.meta.env.VITE_DEFAULT_AVATAR}
            alt="profile"
            className="w-10 h-10 rounded-full cursor-pointer border border-[#1f2c33]"
          />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Profile
          </span>
        </div>
      </div>
      <UserPanel
        mode={panelMode}
        isOpen={panelMode !== null}
        onClose={() => setPanelMode(null)}
      />
      <PendingRequestsPanel
        isOpen={pendingOpen}
        onClose={() => setPendingOpen(null)}
      />
    </div>
  );
}
