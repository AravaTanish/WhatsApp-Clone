import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { FaDownload } from "react-icons/fa6";

function MessageContent({ msg, user }) {
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const handleDownload = async () => {
    try {
      const response = await fetch(fullscreenImage);
      const blob = await response.blob();
      console.log(blob);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WhatsApp_Clone_${Date.now()}.jpg`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (msg.deletedForEveryone) {
    return (
      <p>
        {msg.sender === user.id
          ? "You deleted this message"
          : "This message was deleted"}
      </p>
    );
  }

  return (
    <>
      {msg.contentType === "text" && <p>{msg.text}</p>}

      {msg.contentType === "image" && (
        <img
          src={msg.mediaUrl}
          alt="Image"
          className="max-w-62.5 rounded-lg object-cover cursor-pointer"
          onClick={() => setFullscreenImage(msg.mediaUrl)}
        />
      )}

      {msg.contentType === "video" && (
        <video src={msg.mediaUrl} controls className="max-w-62.5 rounded-lg" />
      )}

      {fullscreenImage && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Back button */}
          <button
            className="absolute top-5 left-5 text-gray-400 text-3xl font-bold hover:text-white"
            onClick={() => setFullscreenImage(null)}
          >
            <FiArrowLeft />
          </button>

          {/* Download button */}
          <button
            className="absolute top-5 right-5 text-gray-400 text-xl px-4 py-2 border-gray-400 border-2 rounded-lg hover:rounded-full hover:border-white hover:text-white"
            onClick={handleDownload}
          >
            <div className="flex flex-row items-center justify-center cursor-pointer">
              <FaDownload /> Download
            </div>
          </button>

          <img
            src={fullscreenImage}
            alt="Fullscreen"
            className="max-h-screen max-w-screen object-contain"
          />
        </div>
      )}
    </>
  );
}

export default MessageContent;
