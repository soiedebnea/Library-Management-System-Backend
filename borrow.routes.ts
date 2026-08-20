import { Router } from "express";
import {
  getBorrowRecords,
  borrowBook,
  returnBook,
  payFine,
  getDashboardStats,
} from "../controllers/borrow.controller";

const router = Router();

router.get("/", getBorrowRecords);
router.get("/stats", getDashboardStats);
router.post("/", borrowBook);
router.put("/:id/return", returnBook);
router.put("/:id/pay-fine", payFine);

export default router;