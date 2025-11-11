import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getAllGroups,
  getMyGroups,
  getAvailableGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
} from "../controllers/group.controller.js";
import {
  getMessagesByGroupId,
  sendGroupMessage,
} from "../controllers/group.message.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getAllGroups);
router.get("/my-groups", getMyGroups);
router.get("/available", getAvailableGroups);
router.get("/:id", getGroupById);
router.get("/:id/messages", getMessagesByGroupId);

router.post("/", createGroup);
router.post("/:id/join", joinGroup);
router.post("/:id/send", sendGroupMessage);
router.post("/:id/leave", leaveGroup);

export default router;
