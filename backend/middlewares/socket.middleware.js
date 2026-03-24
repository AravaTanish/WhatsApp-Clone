import jwt from "jsonwebtoken";

const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

    socket.user = {
      id: decoded.userId,
    };

    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};

export default socketAuthMiddleware;
