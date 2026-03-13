import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User";
import { JWT_SECRET } from "../config/env";
import { authRequired, requireRole } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STAFF", "SECRETARIAT", "CASE_MANAGER", "ADMIN"]),
  department: z.string().optional(),
});

router.post("/register", authRequired, requireRole(["ADMIN"]), async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid data", errors: parse.error.flatten() });
  }

  const { name, email, password, role, department } = parse.data;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, passwordHash, role, department });

  return res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const { email, password } = parse.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

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

router.get("/me", authRequired, async (req, res) => {
  const user = await User.findById(req.user!.userId).select("-passwordHash");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json(user);
});

export default router;

