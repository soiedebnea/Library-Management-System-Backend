import { Router } from "express";
import {
  getMembers,
  getMemberById,
  getMemberHistory,
  createMember,
  updateMember,
  deleteMember,
} from "../controllers/member.controller";

const router = Router();

router.get("/", getMembers);
router.get("/:id", getMemberById);
router.get("/:id/history", getMemberHistory);
router.post("/", createMember);
router.put("/:id", updateMember);
router.delete("/:id", deleteMember);

export default router;