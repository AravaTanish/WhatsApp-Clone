import { useEffect, useRef } from "react";

export default function MessageList({ messages }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.sender === "me"
              ? "justify-end"
              : "justify-start"
          }`}
        >
          <div
            className={`px-4 py-2 rounded-2xl text-sm max-w-xs md:max-w-md shadow
            ${
              msg.sender === "me"
                ? "bg-[#22c55e] text-black"
                : "bg-[#1f2c33]"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}