"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectDB() {
    if (!env_1.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }
    await mongoose_1.default.connect(env_1.MONGO_URI);
    console.log("Connected to MongoDB");
}
