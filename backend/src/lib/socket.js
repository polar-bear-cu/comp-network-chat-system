import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const socketServer = new Server(server, {
  cors: { origin: [process.env.CLIENT_URL], credentials: true },
});

socketServer.use(socketAuthMiddleware);

const userSocketMap = {};

socketServer.on("connection", (socket) => {
  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  socketServer.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    socketServer.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { socketServer, app, server };
