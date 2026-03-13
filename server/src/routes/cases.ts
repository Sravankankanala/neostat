import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { authRequired, requireRole } from "../middleware/auth";
import { Case } from "../models/Case";
import { generateTrackingId } from "../utils/tracking";

const router = Router();

const uploadDir = path.resolve("src/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const submissionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["Safety", "Policy", "Facilities", "HR", "Other"]),
  department: z.string().min(1),
  location: z.string().min(1),
  severity: z.enum(["Low", "Medium", "High"]),
  anonymous: z.coerce.boolean().optional().default(false),
});

router.post(
  "/",
  authRequired,
  requireRole(["STAFF", "SECRETARIAT", "CASE_MANAGER", "ADMIN"]),
  upload.array("files", 5),
  async (req, res) => {
    const parse = submissionSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: "Invalid data", errors: parse.error.flatten() });
    }

    const trackingId = await generateTrackingId();
    const filePaths = (req.files as Express.Multer.File[] | undefined)?.map((f) => f.filename) ?? [];

    const { anonymous, ...rest } = parse.data;

    const createdBy = anonymous ? null : req.user!.userId;

    const newCase = await Case.create({
      trackingId,
      ...rest,
      anonymous,
      createdBy,
      status: "NEW",
      history: [
        {
          status: "NEW",
          note: "Case submitted",
          actor: createdBy,
        },
      ],
      attachments: filePaths,
    });

    return res.status(201).json(newCase);
  }
);

router.get("/my", authRequired, requireRole(["STAFF"]), async (req, res) => {
  const cases = await Case.find({ createdBy: req.user!.userId }).sort({ createdAt: -1 });
  return res.json(cases);
});

router.get(
  "/inbox",
  authRequired,
  requireRole(["SECRETARIAT", "ADMIN"]),
  async (_req, res) => {
    const cases = await Case.find().sort({ createdAt: -1 }).populate("assignedTo", "name");
    return res.json(cases);
  }
);

router.get(
  "/assigned",
  authRequired,
  requireRole(["CASE_MANAGER"]),
  async (req, res) => {
    const cases = await Case.find({ assignedTo: req.user!.userId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name")
      .populate("assignedTo", "name");
    return res.json(cases);
  }
);

const assignSchema = z.object({
  caseId: z.string(),
  caseManagerId: z.string(),
});

router.post(
  "/assign",
  authRequired,
  requireRole(["SECRETARIAT", "ADMIN"]),
  async (req, res) => {
    const parse = assignSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const { caseId, caseManagerId } = parse.data;

    const existing = await Case.findById(caseId);
    if (!existing) {
      return res.status(404).json({ message: "Case not found" });
    }

    existing.assignedTo = caseManagerId as any;
    existing.status = "ASSIGNED";
    existing.assignedAt = new Date();
    existing.history.push({
      status: "ASSIGNED",
      note: "Case assigned to manager",
      actor: req.user!.userId as any,
      createdAt: new Date(),
    });

    await existing.save();
    return res.json(existing);
  }
);

const updateStatusSchema = z.object({
  caseId: z.string(),
  status: z.enum(["IN_PROGRESS", "PENDING", "RESOLVED"]),
  note: z.string().optional(),
  impactSummary: z.string().optional(),
  actionTaken: z.string().optional(),
  changeOutcome: z.string().optional(),
});

router.post(
  "/update",
  authRequired,
  requireRole(["CASE_MANAGER", "SECRETARIAT", "ADMIN"]),
  async (req, res) => {
    const parse = updateStatusSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const { caseId, status, note, impactSummary, actionTaken, changeOutcome } = parse.data;

    const c = await Case.findById(caseId);
    if (!c) {
      return res.status(404).json({ message: "Case not found" });
    }

    c.status = status;
    if (impactSummary !== undefined) c.impactSummary = impactSummary;
    if (actionTaken !== undefined) c.actionTaken = actionTaken;
    if (changeOutcome !== undefined) c.changeOutcome = changeOutcome;

    c.history.push({
      status,
      note,
      actor: req.user!.userId as any,
      createdAt: new Date(),
    });

    c.lastResponseAt = new Date();

    await c.save();
    return res.json(c);
  }
);

router.get("/:id", authRequired, async (req, res) => {
  const c = await Case.findById(req.params.id)
    .populate("createdBy", "name")
    .populate("assignedTo", "name");
  if (!c) {
    return res.status(404).json({ message: "Case not found" });
  }

  // Staff can only see their own cases (or anonymous cases they created, which are not linked)
  if (req.user!.role === "STAFF") {
    if (!c.createdBy || c.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  return res.json(c);
});

export default router;

