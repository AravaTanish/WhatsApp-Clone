import { useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { MdGroups } from "react-icons/md";
import { FiPhone, FiSettings } from "react-icons/fi";
import { TiUserAdd } from "react-icons/ti";
import { LuMessageCircleDashed } from "react-icons/lu";
import AddFriendPanel from "./AddFriendPannel.jsx";

export default function LeftRail() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
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
          <TiUserAdd size={24} onClick={() => setIsPanelOpen(true)} />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Add Friends
          </span>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="flex flex-col items-center gap-6">
        {/* Divider */}
        <div className="w-8 h-px bg-[#1f2c33]" />

        {/* Settings */}
        <div className="flex items-center group cursor-pointer text-gray-400 hover:text-white transition">
          <FiSettings
            size={22}
            className="text-gray-400 hover:text-white cursor-pointer transition"
          />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Settings
          </span>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center group cursor-pointer text-gray-400 hover:text-white transition">
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="profile"
            className="w-10 h-10 rounded-full cursor-pointer border border-[#1f2c33]"
          />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Profile
          </span>
        </div>
      </div>
      <AddFriendPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
