import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllContacts } from "../controllers/message.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/contacts", getAllContacts);

export default router;
