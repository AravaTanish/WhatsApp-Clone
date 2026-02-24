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
        <div className="relative group cursor-pointer">
          <IoChatbubbleEllipsesOutline size={26} className="text-[#22c55e]" />
          <span className="absolute left-12 text-xs bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Chats
          </span>
        </div>

        {/* Groups */}
        <div className="group cursor-pointer text-gray-400 hover:text-white transition">
          <MdGroups size={24} />
        </div>

        {/* Status */}
        <div className="group cursor-pointer text-gray-400 hover:text-white transition">
          <LuMessageCircleDashed size={24} />
        </div>

        {/* Calls */}
        <div className="group cursor-pointer text-gray-400 hover:text-white transition">
          <FiPhone size={22} />
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-[#1f2c33]" />

        {/* Add Friends */}
        <div className="group cursor-pointer text-gray-400 hover:text-white transition">
          <TiUserAdd size={24} onClick={() => setIsPanelOpen(true)} />
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="flex flex-col items-center gap-6">
        {/* Divider */}
        <div className="w-8 h-px bg-[#1f2c33]" />

        {/* Settings */}
        <FiSettings
          size={22}
          className="text-gray-400 hover:text-white cursor-pointer transition"
        />

        {/* Profile Avatar */}
        <img
          src="https://i.pravatar.cc/150?img=12"
          alt="profile"
          className="w-10 h-10 rounded-full cursor-pointer border border-[#1f2c33]"
        />
      </div>
      <AddFriendPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
