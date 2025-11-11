import express from "express";
import rateLimit from "express-rate-limit";
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

const groupMessageRateLimit = rateLimit({
  windowMs: 1000,
  max: 1,
  keyGenerator: (req) => `${req.user._id.toString()}-${req.params.id}`,
  message: {
    error: "Too many messages sent to this group. Please wait before sending another message.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/", getAllGroups);
router.get("/my-groups", getMyGroups);
router.get("/available", getAvailableGroups);
router.get("/:id", getGroupById);
router.get("/:id/messages", getMessagesByGroupId);

router.post("/", createGroup);
router.post("/:id/join", joinGroup);
router.post("/:id/send", groupMessageRateLimit, sendGroupMessage);
router.post("/:id/leave", leaveGroup);

export default router;
