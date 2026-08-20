import { Request, Response } from "express";
import { Book } from "../models/Book.model";
import { AppError, asyncHandler } from "../middleware/errorHandler";

// GET /api/books?search=&category=
export const getBooks = asyncHandler(async (req: Request, res: Response) => {
  const { search, category } = req.query;
  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { title: { $regex: String(search), $options: "i" } },
      { author: { $regex: String(search), $options: "i" } },
      { isbn: { $regex: String(search), $options: "i" } },
    ];
  }
  if (category) {
    filter.category = category;
  }

  const books = await Book.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: books });
});

// GET /api/books/:id
export const getBookById = asyncHandler(async (req: Request, res: Response) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new AppError("Book not found", 404);
  res.json({ success: true, data: book });
});

// POST /api/books
export const createBook = asyncHandler(async (req: Request, res: Response) => {
  const { title, author, isbn, category, publisher, totalCopies } = req.body;

  if (!title || !author || !isbn || !category || !totalCopies) {
    throw new AppError("title, author, isbn, category and totalCopies are required");
  }

  const existing = await Book.findOne({ isbn });
  if (existing) throw new AppError("A book with this ISBN already exists", 409);

  const book = await Book.create({
    title,
    author,
    isbn,
    category,
    publisher,
    totalCopies,
    availableCopies: totalCopies,
  });

  res.status(201).json({ success: true, data: book, message: "Book added successfully" });
});

// PUT /api/books/:id
export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const { title, author, isbn, category, publisher, totalCopies } = req.body;
  const book = await Book.findById(req.params.id);
  if (!book) throw new AppError("Book not found", 404);

  // Keep availableCopies consistent if totalCopies changes
  if (totalCopies !== undefined && totalCopies !== book.totalCopies) {
    const diff = totalCopies - book.totalCopies;
    book.availableCopies = Math.max(0, book.availableCopies + diff);
    book.totalCopies = totalCopies;
  }

  if (title) book.title = title;
  if (author) book.author = author;
  if (isbn) book.isbn = isbn;
  if (category) book.category = category;
  if (publisher !== undefined) book.publisher = publisher;

  await book.save();
  res.json({ success: true, data: book, message: "Book updated successfully" });
});

// DELETE /api/books/:id
export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new AppError("Book not found", 404);

  if (book.availableCopies < book.totalCopies) {
    throw new AppError("Cannot delete a book that currently has copies on loan", 409);
  }

  await book.deleteOne();
  res.json({ success: true, data: null, message: "Book deleted successfully" });
});