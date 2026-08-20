import { Request, Response } from "express";
import { BorrowRecord } from "../models/Borrow.model";
import { Book } from "../models/Book.model";
import { Member } from "../models/Member.model";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { calculateDueDate, calculateFine, isOverdue } from "../services/fine.service";

// GET /api/borrow?status=&memberId=&bookId=
export const getBorrowRecords = asyncHandler(async (req: Request, res: Response) => {
  const { status, memberId, bookId } = req.query;
  const filter: Record<string, any> = {};

  if (status) filter.status = status;
  if (memberId) filter.member = memberId;
  if (bookId) filter.book = bookId;

  const records = await BorrowRecord.find(filter)
    .populate("book", "title author isbn")
    .populate("member", "name email")
    .sort({ createdAt: -1 });

  // Attach a live-calculated fine for records still out on loan
  const withLiveFine = records.map((r) => {
    const record = r.toObject();
    if (record.status !== "returned") {
      record.fineAmount = calculateFine(record.dueDate);
      record.status = isOverdue(record.dueDate, null) ? "overdue" : "borrowed";
    }
    return record;
  });

  res.json({ success: true, data: withLiveFine });
});

// POST /api/borrow  { bookId, memberId }
export const borrowBook = asyncHandler(async (req: Request, res: Response) => {
  const { bookId, memberId } = req.body;
  if (!bookId || !memberId) throw new AppError("bookId and memberId are required");

  const [book, member] = await Promise.all([
    Book.findById(bookId),
    Member.findById(memberId),
  ]);

  if (!book) throw new AppError("Book not found", 404);
  if (!member) throw new AppError("Member not found", 404);
  if (member.status !== "active") throw new AppError("Member account is not active", 403);
  if (book.availableCopies < 1) throw new AppError("No available copies of this book", 409);

  const outstandingFines = await BorrowRecord.find({
    member: memberId,
    status: { $ne: "returned" },
    fineAmount: { $gt: 0 },
    finePaid: false,
  });
  const unpaidTotal = outstandingFines.reduce((sum, r) => sum + calculateFine(r.dueDate), 0);
  if (unpaidTotal > 0) {
    throw new AppError(
      `Member has outstanding fines of ${unpaidTotal}. Please settle fines before borrowing.`,
      403
    );
  }

  const borrowDate = new Date();
  const dueDate = calculateDueDate(borrowDate);

  const record = await BorrowRecord.create({
    book: bookId,
    member: memberId,
    borrowDate,
    dueDate,
    status: "borrowed",
  });

  book.availableCopies -= 1;
  await book.save();

  const populated = await record.populate([
    { path: "book", select: "title author isbn" },
    { path: "member", select: "name email" },
  ]);

  res.status(201).json({ success: true, data: populated, message: "Book issued successfully" });
});

// PUT /api/borrow/:id/return
export const returnBook = asyncHandler(async (req: Request, res: Response) => {
  const record = await BorrowRecord.findById(req.params.id);
  if (!record) throw new AppError("Borrow record not found", 404);
  if (record.status === "returned") throw new AppError("This book has already been returned", 409);

  const returnDate = new Date();
  const fine = calculateFine(record.dueDate, returnDate);

  record.returnDate = returnDate;
  record.fineAmount = fine;
  record.status = "returned";
  await record.save();

  const book = await Book.findById(record.book);
  if (book) {
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    await book.save();
  }

  const populated = await record.populate([
    { path: "book", select: "title author isbn" },
    { path: "member", select: "name email" },
  ]);

  res.json({
    success: true,
    data: populated,
    message: fine > 0 ? `Book returned. Fine due: ${fine}` : "Book returned on time, no fine due",
  });
});

// PUT /api/borrow/:id/pay-fine
export const payFine = asyncHandler(async (req: Request, res: Response) => {
  const record = await BorrowRecord.findById(req.params.id);
  if (!record) throw new AppError("Borrow record not found", 404);

  record.finePaid = true;
  await record.save();

  res.json({ success: true, data: record, message: "Fine marked as paid" });
});

// GET /api/borrow/stats  -> dashboard summary numbers
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalBooks, totalMembers, activeLoans, overdueRecords] = await Promise.all([
    Book.countDocuments(),
    Member.countDocuments(),
    BorrowRecord.countDocuments({ status: { $ne: "returned" } }),
    BorrowRecord.find({ status: { $ne: "returned" } }),
  ]);

  let overdueCount = 0;
  let totalOutstandingFines = 0;

  for (const r of overdueRecords) {
    const fine = calculateFine(r.dueDate);
    if (fine > 0) {
      overdueCount += 1;
      totalOutstandingFines += fine;
    }
  }

  const booksAggregate = await Book.aggregate([
    { $group: { _id: null, totalCopies: { $sum: "$totalCopies" }, available: { $sum: "$availableCopies" } } },
  ]);
  const copiesOnLoan = booksAggregate.length
    ? booksAggregate[0].totalCopies - booksAggregate[0].available
    : 0;

  res.json({
    success: true,
    data: {
      totalBooks,
      totalMembers,
      activeLoans,
      overdueCount,
      copiesOnLoan,
      totalOutstandingFines,
    },
  });
});