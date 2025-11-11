import { socketServer } from "../lib/socket.js";
import GroupMessage from "../model/group.message.model.js";

export async function getMessagesByGroupId(req, res) {
  try {
    const groupId = req.params.id;
    if (!groupId) {
      return res.status(400).json({ message: "No group id provided" });
    }

    const messages = await GroupMessage.find({ groupId })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendGroupMessage(req, res) {
  try {
    const { text } = req.body;
    const groupId = req.params.id;
    if (!groupId || !text) {
      return res.status(400).json({ message: "Group ID and text required" });
    }

    const loggedInUserId = req.user._id;

    const newMessage = new GroupMessage({
      sender: loggedInUserId,
      groupId,
      text,
      readBy: [],
    });

    await newMessage.save();
    await newMessage.populate("sender", "username");

    socketServer.emit("newGroupMessage", {
      ...newMessage.toObject(),
      groupId,
    });

    socketServer.emit("newGroupMessageNotification", {
      ...newMessage.toObject(),
      groupId,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function markGroupMessagesAsRead(req, res) {
  try {
    const groupId = req.params.id;
    const loggedInUserId = req.user._id;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID required" });
    }

    await GroupMessage.updateMany(
      { 
        groupId,
        sender: { $ne: loggedInUserId },
        readBy: { $nin: [loggedInUserId] },
        isSystemMessage: { $ne: true }
      },
      { 
        $addToSet: { readBy: loggedInUserId }
      }
    );

    socketServer.emit("groupMessagesRead", {
      groupId,
      userId: loggedInUserId
    });

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking group messages as read:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function markAllPreviousMessagesAsRead(groupId, userId) {
  try {
    await GroupMessage.updateMany(
      { 
        groupId,
        sender: { $ne: userId },
        readBy: { $nin: [userId] },
        isSystemMessage: { $ne: true }
      },
      { 
        $addToSet: { readBy: userId }
      }
    );

    socketServer.emit("groupMessagesRead", {
      groupId,
      userId
    });
  } catch (error) {
    console.error("Error marking previous messages as read:", error);
  }
}
