import { useEffect, useRef } from "react";
import useUserStore from "../../store/userStore.js";

export default function MessageList({ messages }) {
  const messagesEndRef = useRef(null);
  const { user } = useUserStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg) => {
        const time = new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={msg._id}
            className={`flex ${
              msg.sender === user.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl text-sm max-w-xs md:max-w-md shadow
              ${
                msg.sender === user.id
                  ? "bg-[#22c55e] text-black"
                  : "bg-[#1f2c33]"
              }`}
            >
              <p>{msg.text}</p>

              {/* Time */}
              <p className="text-[10px] mt-1 opacity-70 text-right">{time}</p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
