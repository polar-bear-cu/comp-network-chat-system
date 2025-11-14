import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import { create } from "domain";

const app = express();
const server = http.createServer(app);

const socketServer = new Server(server, {
  cors: { origin: [process.env.CLIENT_URL], credentials: true },
});

socketServer.use(socketAuthMiddleware);

const userSocketMap = {};

const typingState = {
  direct: {}, // { userId: { receiverId: true } }
  group: {}, // { groupId: { userId: username } }
};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

socketServer.on("connection", (socket) => {
  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  socketServer.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.join(userId);

  socket.on("typing", ({ receiverId }) => {
    if (!typingState.direct[userId]) {
      typingState.direct[userId] = {};
    }
    typingState.direct[userId][receiverId] = true;

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      socketServer.to(receiverSocketId).emit("userTyping", {
        senderId: userId,
      });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    if (typingState.direct[userId]) {
      delete typingState.direct[userId][receiverId];
      if (Object.keys(typingState.direct[userId]).length === 0) {
        delete typingState.direct[userId];
      }
    }

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      socketServer.to(receiverSocketId).emit("userStopTyping", {
        senderId: userId,
      });
    }
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const newMessage = {
      senderId,
      receiverId,
      text,
      createdAt: new Date(),
    };

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      socketServer.to(receiverSocketId).emit("newMessage", newMessage);
      socketServer
        .to(receiverSocketId)
        .emit("newMessageNotification", newMessage);
    }
  });

  socket.on("sendGroupMessage", ({ sender, groupId, text }) => {
    const newMessage = {
      sender,
      groupId,
      text,
      readBy: [],
      createdAt: new Date(),
    };

    socketServer.to(groupId).emit("newGroupMessage", {
      ...newMessage,
      groupId,
    });

    socketServer.to(groupId).emit("newGroupMessageNotification", {
      ...newMessage,
      groupId,
      senderId: sender._id,
    });
  });

  socket.on("joinGroup", ({ groupId }) => {
    socket.join(groupId);

    if (typingState.group[groupId]) {
      Object.entries(typingState.group[groupId]).forEach(
        ([typingUserId, username]) => {
          if (typingUserId !== userId) {
            socket.emit("groupUserTyping", {
              groupId,
              userId: typingUserId,
              username,
            });
          }
        }
      );
    }
  });

  socket.on("leaveGroup", ({ groupId }) => {
    if (typingState.group[groupId] && typingState.group[groupId][userId]) {
      delete typingState.group[groupId][userId];
      if (Object.keys(typingState.group[groupId]).length === 0) {
        delete typingState.group[groupId];
      }

      socket.to(groupId).emit("groupUserStopTyping", {
        groupId,
        userId,
      });
    }

    socket.leave(groupId);
  });

  socket.on("groupTyping", ({ groupId }) => {
    if (!typingState.group[groupId]) {
      typingState.group[groupId] = {};
    }
    typingState.group[groupId][userId] = socket.user.username;

    socket.to(groupId).emit("groupUserTyping", {
      groupId,
      userId,
      username: socket.user.username,
    });
  });

  socket.on("groupStopTyping", ({ groupId }) => {
    if (typingState.group[groupId]) {
      delete typingState.group[groupId][userId];
      if (Object.keys(typingState.group[groupId]).length === 0) {
        delete typingState.group[groupId];
      }
    }

    socket.to(groupId).emit("groupUserStopTyping", {
      groupId,
      userId,
    });
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];

    if (typingState.direct[userId]) {
      Object.keys(typingState.direct[userId]).forEach((receiverId) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          socketServer.to(receiverSocketId).emit("userStopTyping", {
            senderId: userId,
          });
        }
      });
      delete typingState.direct[userId];
    }

    Object.keys(typingState.group).forEach((groupId) => {
      if (typingState.group[groupId][userId]) {
        delete typingState.group[groupId][userId];
        if (Object.keys(typingState.group[groupId]).length === 0) {
          delete typingState.group[groupId];
        }

        socketServer.to(groupId).emit("groupUserStopTyping", {
          groupId,
          userId,
        });
      }
    });

    socketServer.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { socketServer, app, server };
