import { Schema, model, Document } from "mongoose";

export type MemberStatus = "active" | "inactive";

export interface IMember extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  membershipDate: Date;
  status: MemberStatus;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    membershipDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export const Member = model<IMember>("Member", memberSchema);