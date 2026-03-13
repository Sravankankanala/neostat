import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { authRequired, requireRole } from "../middleware/auth";
import { Minute } from "../models/Minute";

const router = Router();

const uploadDir = path.resolve("src/uploads/minutes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const createMinuteSchema = z.object({
  title: z.string().min(1),
  department: z.string().optional(),
  meetingDate: z.string().min(1),
});

router.post(
  "/",
  authRequired,
  requireRole(["SECRETARIAT", "ADMIN"]),
  upload.single("file"),
  async (req, res) => {
    const parse = createMinuteSchema.safeParse(req.body);
    if (!parse.success || !req.file) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const { title, department, meetingDate } = parse.data;

    const minute = await Minute.create({
      title,
      department,
      meetingDate: new Date(meetingDate),
      filePath: req.file.filename,
    });

    return res.status(201).json(minute);
  }
);

router.get("/", async (req, res) => {
  const { q } = req.query;
  const filter: any = {};
  if (q && typeof q === "string") {
    filter.title = { $regex: q, $options: "i" };
  }

  const minutes = await Minute.find(filter).sort({ meetingDate: -1 });
  return res.json(minutes);
});

export default router;

