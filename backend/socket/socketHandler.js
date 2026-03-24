import conversationsEvents from "./conversations.events.js";
import onlineUserEvents from "./onlineUsers.events.js";
import socketAuthMiddleware from "../middlewares/socket.middleware.js";

export default function setupSocket(io) {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    const id = socket.user.id;
    socket.join(`user:${id}`);
    console.log("Joined:", id);

    onlineUserEvents(io, socket);
    conversationsEvents(socket);
  });
}
