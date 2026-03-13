import { Router } from "express";
import { z } from "zod";
import { authRequired, requireRole } from "../middleware/auth";
import { Poll } from "../models/Poll";

const router = Router();

const createPollSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
});

router.post(
  "/",
  authRequired,
  requireRole(["SECRETARIAT", "ADMIN"]),
  async (req, res) => {
    const parse = createPollSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const { question, options } = parse.data;

    const poll = await Poll.create({
      question,
      options: options.map((text) => ({ text, votes: 0 })),
      createdBy: req.user!.userId,
    });

    return res.status(201).json(poll);
  }
);

router.get("/", authRequired, async (_req, res) => {
  const polls = await Poll.find().sort({ createdAt: -1 });
  return res.json(polls);
});

const voteSchema = z.object({
  pollId: z.string(),
  optionId: z.string(),
});

router.post("/vote", authRequired, requireRole(["STAFF"]), async (req, res) => {
  const parse = voteSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const { pollId, optionId } = parse.data;

  const poll = await Poll.findById(pollId);
  if (!poll || !poll.isActive) {
    return res.status(404).json({ message: "Poll not found" });
  }

  if (poll.voters.some((v) => v.toString() === req.user!.userId)) {
    return res.status(400).json({ message: "You have already voted" });
  }

  const option = poll.options.find((opt) => opt._id.toString() === optionId);
  if (!option) {
    return res.status(400).json({ message: "Invalid option" });
  }

  option.votes += 1;
  poll.voters.push(req.user!.userId as any);
  await poll.save();

  return res.json(poll);
});

export default router;

