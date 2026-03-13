import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPollOption {
  _id: Types.ObjectId;
  text: string;
  votes: number;
}

export interface IPoll extends Document {
  question: string;
  options: IPollOption[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  voters: Types.ObjectId[];
}

const PollOptionSchema = new Schema<IPollOption>(
  {
    text: { type: String, required: true },
    votes: { type: Number, default: 0 },
  },
  { _id: true }
);

const PollSchema = new Schema<IPoll>(
  {
    question: { type: String, required: true },
    options: { type: [PollOptionSchema], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    voters: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Poll = mongoose.model<IPoll>("Poll", PollSchema);

