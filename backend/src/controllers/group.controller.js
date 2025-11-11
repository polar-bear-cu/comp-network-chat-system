import { socketServer } from "../lib/socket.js";
import GroupMessage from "../model/group.message.model.js";
import Group from "../model/group.model.js";
import { markAllPreviousMessagesAsRead } from "./group.message.controller.js";

export async function getAllGroups(req, res) {
  try {
    const allGroups = await Group.find({})
      .populate("owner", "username")
      .populate("members", "username");

    res.status(200).json(allGroups);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyGroups(req, res) {
  try {
    const loggedInUserId = req.user._id;
    
    const myGroups = await Group.aggregate([
      { $match: { members: { $in: [loggedInUserId] } } },
      { $lookup: { from: "groupmessages", localField: "_id", foreignField: "groupId", as: "messages" } },
      { $addFields: { lastMessageTime: { $max: "$messages.createdAt" } } },
      { $sort: { lastMessageTime: -1, updatedAt: -1 } },
      { $project: { messages: 0 } }
    ]);

    await Group.populate(myGroups, [
      { path: "owner", select: "username" },
      { path: "members", select: "username" }
    ]);

    res.status(200).json(myGroups);
  } catch (error) {
    console.error("Error fetching my groups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAvailableGroups(req, res) {
  try {
    const loggedInUserId = req.user._id;
    
    const availableGroups = await Group.find({
      members: { $nin: [loggedInUserId] }
    })
      .populate("owner", "username")
      .populate("members", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(availableGroups);
  } catch (error) {
    console.error("Error fetching available groups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getGroupById(req, res) {
  try {
    const groupId = req.params.id;
    if (!groupId) {
      return res.status(400).json({ message: "No group id" });
    }

    const group = await Group.findById(groupId)
      .populate("owner", "username")
      .populate("members", "username");

    if (!group) {
      return res.status(400).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createGroup(req, res) {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "No group name" });
    }
    const loggedInUserId = req.user._id;
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ message: "Group name already exists" });
    }

    const newGroup = await Group.create({
      name,
      owner: loggedInUserId,
      members: [loggedInUserId],
    });

    await newGroup.populate("owner", "username");
    await newGroup.populate("members", "username");

    socketServer.emit("newGroup", newGroup);

    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function joinGroup(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const groupId = req.params.id;

    if (!groupId) {
      res.status(400).json({ message: "No group id" });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      res.status(400).json({ message: "Invalid group id" });
    }

    if (group.members.includes(loggedInUserId)) {
      res.status(400).json({ message: "Already in the group" });
    }

    await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: loggedInUserId } },
      { new: true }
    );

    const updatedGroup = await Group.findById(groupId)
      .populate("owner", "username")
      .populate("members", "username");

    const systemMessage = new GroupMessage({
      groupId,
      text: `${req.user.username} joined the group`,
      isSystemMessage: true,
      systemMessageType: "join",
    });
    await systemMessage.save();

    await markAllPreviousMessagesAsRead(groupId, loggedInUserId);

    socketServer.emit("groupUpdated", updatedGroup);
    socketServer.emit("newGroupMessage", {
      ...systemMessage.toObject(),
      group,
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function leaveGroup(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const groupId = req.params.id;

    if (!groupId) {
      return res.status(400).json({ message: "No group id" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(400).json({ message: "Invalid group id" });
    }

    if (!group.members.includes(loggedInUserId)) {
      return res
        .status(400)
        .json({ message: `${group.members} : ${loggedInUserId}` });
    }

    if (group.owner.toString() === loggedInUserId.toString()) {
      return res.status(400).json({
        message: "Owner can't leave the group",
      });
    }

    await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: loggedInUserId } },
      { new: true }
    );

    const updatedGroup = await Group.findById(groupId)
      .populate("owner", "username")
      .populate("members", "username");

    const systemMessage = new GroupMessage({
      groupId,
      text: `${req.user.username} left the group`,
      isSystemMessage: true,
      systemMessageType: "leave",
    });
    await systemMessage.save();

    socketServer.emit("groupUpdated", updatedGroup);
    socketServer.emit("newGroupMessage", {
      ...systemMessage.toObject(),
      group,
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getGroupUnreadCounts(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const unreadMessages = await GroupMessage.find({
      sender: { $ne: loggedInUserId },
      readBy: { $nin: [loggedInUserId] },
    }).populate({
      path: 'groupId',
      select: 'members',
      match: { members: { $in: [loggedInUserId] } }
    });

    const groupUnreadCounts = {};
    unreadMessages.forEach((message) => {
      if (message.groupId) {
        const groupId = message.groupId._id.toString();
        groupUnreadCounts[groupId] = (groupUnreadCounts[groupId] || 0) + 1;
      }
    });

    res.status(200).json(groupUnreadCounts);
  } catch (error) {
    console.error("Error fetching group unread counts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
