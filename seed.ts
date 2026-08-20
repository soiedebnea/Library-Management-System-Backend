import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db";
import { Book } from "./models/Book.model";
import { Member } from "./models/Member.model";
import mongoose from "mongoose";

const sampleBooks = [
  { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", category: "Software Engineering", totalCopies: 3, availableCopies: 3 },
  { title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "9780201616224", category: "Software Engineering", totalCopies: 2, availableCopies: 2 },
  { title: "1984", author: "George Orwell", isbn: "9780451524935", category: "Fiction", totalCopies: 4, availableCopies: 4 },
  { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", category: "Fiction", totalCopies: 2, availableCopies: 2 },
  { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", category: "Science", totalCopies: 2, availableCopies: 2 },
];

const sampleMembers = [
  { name: "Ayesha Rahman", email: "ayesha@example.com", phone: "01710000001" },
  { name: "Tanvir Hasan", email: "tanvir@example.com", phone: "01710000002" },
  { name: "Nusrat Jahan", email: "nusrat@example.com", phone: "01710000003" },
];

async function seed() {
  await connectDB();

  await Book.deleteMany({});
  await Member.deleteMany({});

  await Book.insertMany(sampleBooks);
  await Member.insertMany(sampleMembers);

  console.log("[seed] Sample books and members inserted successfully.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});