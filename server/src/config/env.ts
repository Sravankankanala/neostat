import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI ;
const jwtSecret = process.env.JWT_SECRET;

export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const MONGO_URI = mongoUri;
export const JWT_SECRET = jwtSecret;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

