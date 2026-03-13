"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Case_1 = require("../models/Case");
const Minute_1 = require("../models/Minute");
const router = (0, express_1.Router)();
router.get("/digest", async (_req, res) => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const resolvedCases = await Case_1.Case.find({
        status: "RESOLVED",
        updatedAt: { $gte: threeMonthsAgo },
    })
        .sort({ updatedAt: -1 })
        .limit(20)
        .select("trackingId category department summary impactSummary actionTaken changeOutcome updatedAt");
    return res.json(resolvedCases);
});
router.get("/impact", async (_req, res) => {
    const impactful = await Case_1.Case.find({
        status: "RESOLVED",
        impactSummary: { $ne: null },
    })
        .sort({ updatedAt: -1 })
        .limit(50)
        .select("trackingId department category impactSummary actionTaken changeOutcome updatedAt");
    return res.json(impactful);
});
router.get("/minutes", async (req, res) => {
    const { q } = req.query;
    const filter = {};
    if (q && typeof q === "string") {
        filter.title = { $regex: q, $options: "i" };
    }
    const minutes = await Minute_1.Minute.find(filter)
        .sort({ meetingDate: -1 })
        .select("title department meetingDate filePath");
    return res.json(minutes);
});
exports.default = router;
