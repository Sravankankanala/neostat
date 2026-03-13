"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get("/case-managers", auth_1.authRequired, (0, auth_1.requireRole)(["SECRETARIAT", "ADMIN"]), async (_req, res) => {
    const managers = await User_1.User.find({ role: "CASE_MANAGER" })
        .sort({ name: 1 })
        .select("_id name email department");
    return res.json(managers);
});
exports.default = router;
