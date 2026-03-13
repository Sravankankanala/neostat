import mongoose, { Schema, Document, Types } from "mongoose";

export type CaseStatus =
  | "NEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING"
  | "RESOLVED"
  | "ESCALATED";

export type CaseCategory = "Safety" | "Policy" | "Facilities" | "HR" | "Other";

export interface ICaseHistoryEntry {
  status: CaseStatus;
  note?: string;
  actor: Types.ObjectId | null;
  createdAt: Date;
}

export interface ICase extends Document {
  trackingId: string;
  title: string;
  description: string;
  category: CaseCategory;
  department: string;
  location: string;
  severity: "Low" | "Medium" | "High";
  anonymous: boolean;
  createdBy?: Types.ObjectId | null;
  assignedTo?: Types.ObjectId | null;
  status: CaseStatus;
  history: ICaseHistoryEntry[];
  attachments: string[];
  impactSummary?: string;
  actionTaken?: string;
  changeOutcome?: string;
  createdAt: Date;
  updatedAt: Date;
  lastResponseAt?: Date;
  assignedAt?: Date;
  escalatedAt?: Date;
  reminderSentAt?: Date;
}

const CaseHistorySchema = new Schema<ICaseHistoryEntry>(
  {
    status: {
      type: String,
      enum: ["NEW", "ASSIGNED", "IN_PROGRESS", "PENDING", "RESOLVED", "ESCALATED"],
      required: true,
    },
    note: { type: String },
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CaseSchema = new Schema<ICase>(
  {
    trackingId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Safety", "Policy", "Facilities", "HR", "Other"],
      required: true,
    },
    department: { type: String, required: true },
    location: { type: String, required: true },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    anonymous: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["NEW", "ASSIGNED", "IN_PROGRESS", "PENDING", "RESOLVED", "ESCALATED"],
      default: "NEW",
    },
    history: { type: [CaseHistorySchema], default: [] },
    attachments: { type: [String], default: [] },
    impactSummary: { type: String },
    actionTaken: { type: String },
    changeOutcome: { type: String },
    lastResponseAt: { type: Date },
    assignedAt: { type: Date },
    escalatedAt: { type: Date },
    reminderSentAt: { type: Date },
  },
  { timestamps: true }
);

export const Case = mongoose.model<ICase>("Case", CaseSchema);

