"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const Poll_1 = require("../models/Poll");
const router = (0, express_1.Router)();
const createPollSchema = zod_1.z.object({
    question: zod_1.z.string().min(1),
    options: zod_1.z.array(zod_1.z.string().min(1)).min(2),
});
router.post("/", auth_1.authRequired, (0, auth_1.requireRole)(["SECRETARIAT", "ADMIN"]), async (req, res) => {
    const parse = createPollSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ message: "Invalid data" });
    }
    const { question, options } = parse.data;
    const poll = await Poll_1.Poll.create({
        question,
        options: options.map((text) => ({ text, votes: 0 })),
        createdBy: req.user.userId,
    });
    return res.status(201).json(poll);
});
router.get("/", auth_1.authRequired, async (_req, res) => {
    const polls = await Poll_1.Poll.find().sort({ createdAt: -1 });
    return res.json(polls);
});
const voteSchema = zod_1.z.object({
    pollId: zod_1.z.string(),
    optionId: zod_1.z.string(),
});
router.post("/vote", auth_1.authRequired, (0, auth_1.requireRole)(["STAFF"]), async (req, res) => {
    const parse = voteSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ message: "Invalid data" });
    }
    const { pollId, optionId } = parse.data;
    const poll = await Poll_1.Poll.findById(pollId);
    if (!poll || !poll.isActive) {
        return res.status(404).json({ message: "Poll not found" });
    }
    if (poll.voters.some((v) => v.toString() === req.user.userId)) {
        return res.status(400).json({ message: "You have already voted" });
    }
    const option = poll.options.find((opt) => opt._id.toString() === optionId);
    if (!option) {
        return res.status(400).json({ message: "Invalid option" });
    }
    option.votes += 1;
    poll.voters.push(req.user.userId);
    await poll.save();
    return res.json(poll);
});
exports.default = router;
