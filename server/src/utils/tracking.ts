import { Case } from "../models/Case";

export async function generateTrackingId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `NEO-${year}-`;

  const lastCase = await Case.findOne({ trackingId: { $regex: `^${prefix}` } })
    .sort({ trackingId: -1 })
    .lean();

  if (!lastCase?.trackingId) {
    return `${prefix}001`;
  }

  const parts = lastCase.trackingId.split("-");
  const lastNumber = parseInt(parts[2] || "0", 10);
  const next = (lastNumber + 1).toString().padStart(3, "0");

  return `${prefix}${next}`;
}

