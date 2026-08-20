import { Schema, model, Document, Types } from "mongoose";

export type BorrowStatus = "borrowed" | "returned" | "overdue";

export interface IBorrowRecord extends Document {
  book: Types.ObjectId;
  member: Types.ObjectId;
  borrowDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  fineAmount: number;
  finePaid: boolean;
  status: BorrowStatus;
  createdAt: Date;
  updatedAt: Date;
}

const borrowSchema = new Schema<IBorrowRecord>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    borrowDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    fineAmount: { type: Number, default: 0, min: 0 },
    finePaid: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["borrowed", "returned", "overdue"],
      default: "borrowed",
    },
  },
  { timestamps: true }
);

borrowSchema.index({ member: 1, status: 1 });
borrowSchema.index({ book: 1, status: 1 });

export const BorrowRecord = model<IBorrowRecord>("BorrowRecord", borrowSchema);