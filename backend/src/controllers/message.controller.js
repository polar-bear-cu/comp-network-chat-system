import User from "../model/user.model.js";
import Message from "../model/message.model.js";
import { getReceiverSocketId, socketServer } from "../lib/socket.js";

export async function getAllContacts(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMessagesByUserId(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const otherUserId = req.params.id;

    const updateResult = await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: loggedInUserId,
        hasRead: false,
      },
      {
        hasRead: true,
      }
    );

    if (updateResult.modifiedCount > 0) {
      const senderSocketId = getReceiverSocketId(otherUserId);
      if (senderSocketId) {
        socketServer.to(senderSocketId).emit("messagesRead", {
          readerId: loggedInUserId,
          senderId: otherUserId,
        });
      }
    }

    const messages = await Message.find({
      $or: [
        {
          senderId: loggedInUserId,
          receiverId: otherUserId,
        },
        { senderId: otherUserId, receiverId: loggedInUserId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function saveMessage(req, res) {
  try {
    const { text } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getChatPartners(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const messages = await Message.find({
      $or: [
        {
          senderId: loggedInUserId,
        },
        { receiverId: loggedInUserId },
      ],
    }).sort({ createdAt: -1 });

    const chatPartnersMap = new Map();

    messages.forEach((msg) => {
      const chatPartnerId =
        msg.senderId.toString() === loggedInUserId.toString()
          ? msg.receiverId.toString()
          : msg.senderId.toString();

      if (!chatPartnersMap.has(chatPartnerId)) {
        chatPartnersMap.set(chatPartnerId, msg.createdAt);
      }
    });

    const chatPartnersId = Array.from(chatPartnersMap.keys());
    const chatPartners = await User.find({
      _id: { $in: chatPartnersId },
    }).select("-password");

    chatPartners.sort((a, b) => {
      const timeA = chatPartnersMap.get(a._id.toString());
      const timeB = chatPartnersMap.get(b._id.toString());
      return new Date(timeB) - new Date(timeA);
    });

    res.status(200).json(chatPartners);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function markMessagesAsRead(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const otherUserId = req.params.id;

    const updateResult = await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: loggedInUserId,
        hasRead: false,
      },
      {
        hasRead: true,
      }
    );

    if (updateResult.modifiedCount > 0) {
      const senderSocketId = getReceiverSocketId(otherUserId);
      if (senderSocketId) {
        socketServer.to(senderSocketId).emit("messagesRead", {
          readerId: loggedInUserId,
          senderId: otherUserId,
        });
      }
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUnreadCounts(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const unreadMessages = await Message.find({
      receiverId: loggedInUserId,
      hasRead: false,
    });

    const unreadCounts = {};
    unreadMessages.forEach((message) => {
      const senderId = message.senderId.toString();
      unreadCounts[senderId] = (unreadCounts[senderId] || 0) + 1;
    });

    res.status(200).json(unreadCounts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
