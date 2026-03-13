import mongoose, { Schema, Document } from "mongoose";

export interface IMinute extends Document {
  title: string;
  department?: string;
  meetingDate: Date;
  filePath: string;
  createdAt: Date;
}

const MinuteSchema = new Schema<IMinute>(
  {
    title: { type: String, required: true },
    department: { type: String },
    meetingDate: { type: Date, required: true },
    filePath: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Minute = mongoose.model<IMinute>("Minute", MinuteSchema);

