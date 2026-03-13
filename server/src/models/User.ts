import mongoose, { Schema, Document, Types } from "mongoose";

export type UserRole = "STAFF" | "SECRETARIAT" | "CASE_MANAGER" | "ADMIN";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["STAFF", "SECRETARIAT", "CASE_MANAGER", "ADMIN"],
      default: "STAFF",
      required: true,
    },
    department: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);

