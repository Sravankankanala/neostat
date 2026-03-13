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
const Minute_1 = require("../models/Minute");
const router = (0, express_1.Router)();
const uploadDir = path_1.default.resolve("src/uploads/minutes");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${unique}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
const createMinuteSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    department: zod_1.z.string().optional(),
    meetingDate: zod_1.z.string().min(1),
});
router.post("/", auth_1.authRequired, (0, auth_1.requireRole)(["SECRETARIAT", "ADMIN"]), upload.single("file"), async (req, res) => {
    const parse = createMinuteSchema.safeParse(req.body);
    if (!parse.success || !req.file) {
        return res.status(400).json({ message: "Invalid data" });
    }
    const { title, department, meetingDate } = parse.data;
    const minute = await Minute_1.Minute.create({
        title,
        department,
        meetingDate: new Date(meetingDate),
        filePath: req.file.filename,
    });
    return res.status(201).json(minute);
});
router.get("/", async (req, res) => {
    const { q } = req.query;
    const filter = {};
    if (q && typeof q === "string") {
        filter.title = { $regex: q, $options: "i" };
    }
    const minutes = await Minute_1.Minute.find(filter).sort({ meetingDate: -1 });
    return res.json(minutes);
});
exports.default = router;
