import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/neoconnect";
const jwtSecret = process.env.JWT_SECRET || "dev-insecure-secret-change-me";

export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const MONGO_URI = mongoUri;
export const JWT_SECRET = jwtSecret;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

