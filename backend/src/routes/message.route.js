import express from "express";
import rateLimit from "express-rate-limit";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners,
  markMessagesAsRead,
  getUnreadCounts,
} from "../controllers/message.controller.js";

const router = express.Router();

router.use(protectRoute);

const messageRateLimit = rateLimit({
  windowMs: 1000,
  max: 1,
  keyGenerator: (req) => req.user._id.toString(),
  message: {
    error: "Too many messages sent. Please wait before sending another message.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/unread-counts", getUnreadCounts);
router.get("/:id", getMessagesByUserId);

router.post("/send/:id", messageRateLimit, sendMessage);
router.put("/mark-read/:id", markMessagesAsRead);

export default router;
