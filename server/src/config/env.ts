import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

if (!mongoUri) {
  throw new Error("MONGO_URI is not defined");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined");
}

export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const MONGO_URI = mongoUri;
export const JWT_SECRET = jwtSecret;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
