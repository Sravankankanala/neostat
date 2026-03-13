"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIENT_ORIGIN = exports.JWT_SECRET = exports.MONGO_URI = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/neoconnect";
const jwtSecret = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
exports.PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
exports.MONGO_URI = mongoUri;
exports.JWT_SECRET = jwtSecret;
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
