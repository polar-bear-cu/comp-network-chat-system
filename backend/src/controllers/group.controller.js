import Group from "../model/group.model.js";
import { socketServer } from "../lib/socket.js";

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

    res.status(201).json(newGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
