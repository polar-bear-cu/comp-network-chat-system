import { socketServer } from "../lib/socket.js";
import Group from "../model/group.model.js";

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

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
