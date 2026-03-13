"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Case_1 = require("../models/Case");
const router = (0, express_1.Router)();
router.get("/summary", auth_1.authRequired, (0, auth_1.requireRole)(["SECRETARIAT", "ADMIN"]), async (_req, res) => {
    const byDepartment = await Case_1.Case.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);
    const byStatus = await Case_1.Case.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);
    const byCategory = await Case_1.Case.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);
    const hotspots = await Case_1.Case.aggregate([
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
});
exports.default = router;
