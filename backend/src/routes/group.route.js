import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getAllGroups,
  getGroupById,
} from "../controllers/group.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getAllGroups);
router.get("/:id", getGroupById);
router.post("/", createGroup);

export default router;
