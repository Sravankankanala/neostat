"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(["STAFF", "SECRETARIAT", "CASE_MANAGER", "ADMIN"]),
    department: zod_1.z.string().optional(),
});
router.post("/register", auth_1.authRequired, (0, auth_1.requireRole)(["ADMIN"]), async (req, res) => {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ message: "Invalid data", errors: parse.error.flatten() });
    }
    const { name, email, password, role, department } = parse.data;
    const existing = await User_1.User.findOne({ email });
    if (existing) {
        return res.status(409).json({ message: "User already exists" });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.User.create({ name, email, passwordHash, role, department });
    return res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
    });
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
router.post("/login", async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const { email, password } = parse.data;
    const user = await User_1.User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user._id.toString(),
        role: user.role,
    }, env_1.JWT_SECRET, { expiresIn: "7d" });
    return res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
        },
    });
});
router.get("/me", auth_1.authRequired, async (req, res) => {
    const user = await User_1.User.findById(req.user.userId).select("-passwordHash");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
});
exports.default = router;
