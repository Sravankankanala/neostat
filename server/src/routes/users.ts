import { Router } from "express";
import { authRequired, requireRole } from "../middleware/auth";
import { User } from "../models/User";

const router = Router();

router.get(
  "/case-managers",
  authRequired,
  requireRole(["SECRETARIAT", "ADMIN"]),
  async (_req, res) => {
    const managers = await User.find({ role: "CASE_MANAGER" })
      .sort({ name: 1 })
      .select("_id name email department");
    return res.json(managers);
  }
);

export default router;

