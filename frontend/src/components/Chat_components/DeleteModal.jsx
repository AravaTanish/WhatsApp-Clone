import api from "../../api/axios.js";
import toast from "react-hot-toast";
import useChatStore from "../../store/chatStore.js";

export default function DeleteModal({
  allValidForEveryone,
  selectedMessages,
  resetSelection,
}) {
  const { selectedChat } = useChatStore();

  const deleteForMe = async () => {
    try {
      const response = await api.delete("/message/delete-me", {
        data: {
          messageIds: selectedMessages,
          conversationId: selectedChat.conversation._id,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      resetSelection();
    }
  };

  const deleteForEveryone = async () => {
    try {
      const response = await api.delete("/message/delete-everyone", {
        data: {
          messageIds: selectedMessages,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      resetSelection();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-[#202c33] p-6 rounded-lg w-80 space-y-3">
        <h3 className="text-center text-lg">Delete messages?</h3>

        <button
          onClick={deleteForMe}
          className="w-full text-green-500 rounded-lg border-2 border-green-500 p-2"
        >
          Delete for me
        </button>

        {allValidForEveryone && (
          <button
            onClick={deleteForEveryone}
            className="w-full text-green-500 rounded-lg border-2 border-green-500 p-2"
          >
            Delete for everyone
          </button>
        )}

        <button
          onClick={resetSelection}
          className="w-full  text-gray-300 rounded-lg border-2 border-gray-400 p-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
