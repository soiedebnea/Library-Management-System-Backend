import { Request, Response } from "express";
import { Member } from "../models/Member.model";
import { BorrowRecord } from "../models/Borrow.model";
import { AppError, asyncHandler } from "../middleware/errorHandler";

// GET /api/members?search=
export const getMembers = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;
  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: String(search), $options: "i" } },
      { email: { $regex: String(search), $options: "i" } },
    ];
  }

  const members = await Member.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: members });
});

// GET /api/members/:id
export const getMemberById = asyncHandler(async (req: Request, res: Response) => {
  const member = await Member.findById(req.params.id);
  if (!member) throw new AppError("Member not found", 404);
  res.json({ success: true, data: member });
});

// GET /api/members/:id/history
export const getMemberHistory = asyncHandler(async (req: Request, res: Response) => {
  const records = await BorrowRecord.find({ member: req.params.id })
    .populate("book")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: records });
});

// POST /api/members
export const createMember = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, address } = req.body;
  if (!name || !email) throw new AppError("name and email are required");

  const existing = await Member.findOne({ email });
  if (existing) throw new AppError("A member with this email already exists", 409);

  const member = await Member.create({ name, email, phone, address });
  res.status(201).json({ success: true, data: member, message: "Member registered successfully" });
});

// PUT /api/members/:id
export const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, address, status } = req.body;
  const member = await Member.findById(req.params.id);
  if (!member) throw new AppError("Member not found", 404);

  if (name) member.name = name;
  if (email) member.email = email;
  if (phone !== undefined) member.phone = phone;
  if (address !== undefined) member.address = address;
  if (status) member.status = status;

  await member.save();
  res.json({ success: true, data: member, message: "Member updated successfully" });
});

// DELETE /api/members/:id
export const deleteMember = asyncHandler(async (req: Request, res: Response) => {
  const activeLoans = await BorrowRecord.countDocuments({
    member: req.params.id,
    status: { $in: ["borrowed", "overdue"] },
  });
  if (activeLoans > 0) {
    throw new AppError("Cannot delete a member with active borrowed books", 409);
  }

  const member = await Member.findByIdAndDelete(req.params.id);
  if (!member) throw new AppError("Member not found", 404);

  res.json({ success: true, data: null, message: "Member removed successfully" });
});