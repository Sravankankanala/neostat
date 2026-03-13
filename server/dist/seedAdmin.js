"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./config/db");
const User_1 = require("./models/User");
async function main() {
    await (0, db_1.connectDB)();
    const email = "admin@neoconnect.local";
    const password = "Admin123!";
    const existing = await User_1.User.findOne({ email });
    if (existing) {
        console.log("Admin user already exists:", email);
        process.exit(0);
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.User.create({
        name: "NeoConnect Admin",
        email,
        passwordHash,
        role: "ADMIN",
        department: "IT",
    });
    console.log("Created admin user:");
    console.log(" Email:", user.email);
    console.log(" Password:", password);
    process.exit(0);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
