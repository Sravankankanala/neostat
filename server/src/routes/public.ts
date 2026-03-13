import { Router } from "express";
import { Case } from "../models/Case";
import { Minute } from "../models/Minute";

const router = Router();

router.get("/digest", async (_req, res) => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const resolvedCases = await Case.find({
    status: "RESOLVED",
    updatedAt: { $gte: threeMonthsAgo },
  })
    .sort({ updatedAt: -1 })
    .limit(20)
    .select("trackingId category department summary impactSummary actionTaken changeOutcome updatedAt");

  return res.json(resolvedCases);
});

router.get("/impact", async (_req, res) => {
  const impactful = await Case.find({
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
  const filter: any = {};
  if (q && typeof q === "string") {
    filter.title = { $regex: q, $options: "i" };
  }

  const minutes = await Minute.find(filter)
    .sort({ meetingDate: -1 })
    .select("title department meetingDate filePath");

  return res.json(minutes);
});

export default router;

