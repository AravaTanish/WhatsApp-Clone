import { onlineUsers, socketToUser } from "./onlineUsers.js";
import { markPendingMessagesAsDelivered } from "./messageStatus.js";

export default function onlineUserEvents(io, socket) {
  socket.on("addUser", async () => {
    const id = socket.user.id;
    if (!onlineUsers.has(id)) {
      onlineUsers.set(id, new Set());
    }

    const userSockets = onlineUsers.get(id);
    const wasOffline = userSockets.size === 0;

    if (!userSockets.has(socket.id)) {
      userSockets.add(socket.id);
      socketToUser.set(socket.id, id);
      console.log("Connected:", id, "->", socket.id);
    }

    if (wasOffline) {
      io.emit("userOnline", id);
    }

    await markPendingMessagesAsDelivered(id);
  });

  socket.on("checkUserOnline", (id) => {
    const isOnline = onlineUsers.has(id);
    socket.emit("userOnlineStatus", {
      id,
      isOnline,
    });
  });

  socket.on("disconnect", () => {
    const id = socketToUser.get(socket.id);
    if (!id) return;
    console.log("ReceiverId:", socket.activeReceiverId);
    if (socket.activeReceiverId) {
      io.to(`user:${socket.activeReceiverId}`).emit("userStoppedTyping", {
        conversationId: socket.activeConversationId,
        id: id,
      });
      console.log("Stopped Typing");
    }

    const sockets = onlineUsers.get(id);
    if (!sockets) return;

    sockets.delete(socket.id);
    socketToUser.delete(socket.id);

    console.log("Disconnected:", id, "->", socket.id);

    if (sockets.size === 0) {
      onlineUsers.delete(id);
      io.emit("userOffline", id);
    }
  });
}
