import { Router } from "express";
import { authRequired, requireRole } from "../middleware/auth";
import { Case } from "../models/Case";

const router = Router();

router.get(
  "/summary",
  authRequired,
  requireRole(["SECRETARIAT", "ADMIN"]),
  async (_req, res) => {
    const byDepartment = await Case.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byStatus = await Case.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byCategory = await Case.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const hotspots = await Case.aggregate([
      {
        $group: {
          _id: { department: "$department", category: "$category" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 5 } } },
      { $sort: { count: -1 } },
    ]);

    return res.json({ byDepartment, byStatus, byCategory, hotspots });
  }
);

export default router;

