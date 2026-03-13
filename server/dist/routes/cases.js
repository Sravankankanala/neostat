"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const Case_1 = require("../models/Case");
const tracking_1 = require("../utils/tracking");
const router = (0, express_1.Router)();
const uploadDir = path_1.default.resolve("src/uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${unique}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
const submissionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    category: zod_1.z.enum(["Safety", "Policy", "Facilities", "HR", "Other"]),
    department: zod_1.z.string().min(1),
    location: zod_1.z.string().min(1),
    severity: zod_1.z.enum(["Low", "Medium", "High"]),
    anonymous: zod_1.z.coerce.boolean().optional().default(false),
});
router.post("/", auth_1.authRequired, (0, auth_1.requireRole)(["STAFF", "SECRETARIAT", "CASE_MANAGER", "ADMIN"]), upload.array("files", 5), async (req, res) => {
    const parse = submissionSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ message: "Invalid data", errors: parse.error.flatten() });
    }
    const trackingId = await (0, tracking_1.generateTrackingId)();
    const filePaths = req.files?.map((f) => f.filename) ?? [];
    const { anonymous, ...rest } = parse.data;
    const createdBy = anonymous ? null : req.user.userId;
    const newCase = await Case_1.Case.create({
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
});
router.get("/my", auth_1.authRequired, (0, auth_1.requireRole)(["STAFF"]), async (req, res) => {
    const cases = await Case_1.Case.find({ createdBy: req.user.userId }).sort({ createdAt: -1 });
    return res.json(cases);
});
router.get("/inbox", auth_1.authRequired, (0, auth_1.requireRole)(["SECRETARIAT", "ADMIN"]), async (_req, res) => {
    const cases = await Case_1.Case.find().sort({ createdAt: -1 }).populate("assignedTo", "name");
    return res.json(cases);
});
router.get("/assigned", auth_1.authRequired, (0, auth_1.requireRole)(["CASE_MANAGER"]), async (req, res) => {
    const cases = await Case_1.Case.find({ assignedTo: req.user.userId })
        .sort({ createdAt: -1 })
        .populate("createdBy", "name")
        .populate("assignedTo", "name");
    return res.json(cases);
});
const assignSchema = zod_1.z.object({
    caseId: zod_1.z.string(),
    caseManagerId: zod_1.z.string(),
});
router.post("/assign", auth_1.authRequired, (0, auth_1.requireRole)(["SECRETARIAT", "ADMIN"]), async (req, res) => {
    const parse = assignSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ message: "Invalid data" });
    }
    const { caseId, caseManagerId } = parse.data;
    const existing = await Case_1.Case.findById(caseId);
    if (!existing) {
        return res.status(404).json({ message: "Case not found" });
    }
    existing.assignedTo = caseManagerId;
    existing.status = "ASSIGNED";
    existing.assignedAt = new Date();
    existing.history.push({
        status: "ASSIGNED",
        note: "Case assigned to manager",
        actor: req.user.userId,
        createdAt: new Date(),
    });
    await existing.save();
    return res.json(existing);
});
const updateStatusSchema = zod_1.z.object({
    caseId: zod_1.z.string(),
    status: zod_1.z.enum(["IN_PROGRESS", "PENDING", "RESOLVED"]),
    note: zod_1.z.string().optional(),
    impactSummary: zod_1.z.string().optional(),
    actionTaken: zod_1.z.string().optional(),
    changeOutcome: zod_1.z.string().optional(),
});
router.post("/update", auth_1.authRequired, (0, auth_1.requireRole)(["CASE_MANAGER", "SECRETARIAT", "ADMIN"]), async (req, res) => {
    const parse = updateStatusSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ message: "Invalid data" });
    }
    const { caseId, status, note, impactSummary, actionTaken, changeOutcome } = parse.data;
    const c = await Case_1.Case.findById(caseId);
    if (!c) {
        return res.status(404).json({ message: "Case not found" });
    }
    c.status = status;
    if (impactSummary !== undefined)
        c.impactSummary = impactSummary;
    if (actionTaken !== undefined)
        c.actionTaken = actionTaken;
    if (changeOutcome !== undefined)
        c.changeOutcome = changeOutcome;
    c.history.push({
        status,
        note,
        actor: req.user.userId,
        createdAt: new Date(),
    });
    c.lastResponseAt = new Date();
    await c.save();
    return res.json(c);
});
router.get("/:id", auth_1.authRequired, async (req, res) => {
    const c = await Case_1.Case.findById(req.params.id)
        .populate("createdBy", "name")
        .populate("assignedTo", "name");
    if (!c) {
        return res.status(404).json({ message: "Case not found" });
    }
    // Staff can only see their own cases (or anonymous cases they created, which are not linked)
    if (req.user.role === "STAFF") {
        if (!c.createdBy || c.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
    }
    return res.json(c);
});
exports.default = router;
