import { BsSendFill } from "react-icons/bs";

export default function MessageInput({
  newMessage,
  setNewMessage,
  handleSend,
}) {
  return (
    <div className="flex items-center gap-4 px-4 md:px-6 py-4 bg-[#111b21] border-t border-gray-800">
      <input
        type="text"
        placeholder="Type a message"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="flex-1 bg-[#1f2c33] px-5 py-3 rounded-full outline-none text-sm placeholder-gray-400"
      />

      <button
        onClick={handleSend}
        className="bg-[#22c55e] p-3 rounded-full hover:scale-105 transition"
      >
        <BsSendFill size={16} className="text-black" />
      </button>
    </div>
  );
}
