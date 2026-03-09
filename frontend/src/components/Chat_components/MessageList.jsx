import { useEffect, useRef, useState } from "react";
import useUserStore from "../../store/userStore.js";
import DeleteModal from "./DeleteModal.jsx";
import SelectionBar from "./SelectionBar.jsx";

const now = Date.now();

export default function MessageList({
  messages,
  selectionMode,
  setSelectionMode,
}) {
  const messagesEndRef = useRef(null);
  const { user } = useUserStore();

  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleMessage = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleRightClick = (e, msg) => {
    e.preventDefault();
    setSelectionMode(true);
    setSelectedMessages([msg._id]);
  };

  const resetSelection = () => {
    setSelectionMode(false);
    setSelectedMessages([]);
    setShowDeleteModal(false);
  };

  const allValidForEveryone = selectedMessages.every((id) => {
    const msg = messages.find((m) => m._id === id);
    if (!msg) return false;

    const diff = now - new Date(msg.createdAt);
    return (
      msg.sender === user.id &&
      diff <= 24 * 60 * 60 * 1000 &&
      !msg.deletedForEveryone
    );
  });

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const time = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const isSelected = selectedMessages.includes(msg._id);

          return (
            <div
              key={msg._id}
              onContextMenu={(e) => handleRightClick(e, msg)}
              onClick={() => {
                if (selectionMode) toggleMessage(msg._id);
              }}
              className={`flex ${
                msg.sender === user.id ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-center gap-2">
                {selectionMode && (
                  <div
                    className={`w-4.5 h-4.5 flex items-center justify-center border-2 rounded cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? "bg-green-500 border-green-500"
                          : "border-gray-400 bg-transparent"
                      }
                    `}
                  >
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 00-1.408 0L8.25 12.336 4.704 8.79a1 1 0 10-1.408 1.42l4.25 4.25a1 1 0 001.408 0l7.75-7.75a1 1 0 000-1.42z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-xs md:max-w-md shadow
                  ${
                    msg.sender === user.id
                      ? "bg-[#22c55e] text-black"
                      : "bg-[#1f2c33]"
                  }`}
                >
                  <p>
                    {msg.deletedForEveryone
                      ? msg.sender === user.id
                        ? "You deleted this message"
                        : "This message was deleted"
                      : msg.text}
                  </p>

                  <p className="text-[10px] mt-1 opacity-70 text-right">
                    {time}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {selectionMode && (
        <SelectionBar
          count={selectedMessages.length}
          onDelete={() => setShowDeleteModal(true)}
          onCancel={resetSelection}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          allValidForEveryone={allValidForEveryone}
          selectedMessages={selectedMessages}
          resetSelection={resetSelection}
        />
      )}
    </>
  );
}
