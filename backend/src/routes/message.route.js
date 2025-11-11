import express from "express";
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

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/unread-counts", getUnreadCounts);
router.get("/:id", getMessagesByUserId);

router.post("/send/:id", sendMessage);
router.put("/mark-read/:id", markMessagesAsRead);

export default router;
