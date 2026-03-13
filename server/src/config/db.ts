import mongoose from "mongoose";
import { MONGO_URI } from "./env";

export async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
}

