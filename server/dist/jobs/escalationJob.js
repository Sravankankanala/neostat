"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEscalationJob = startEscalationJob;
const node_cron_1 = __importDefault(require("node-cron"));
const Case_1 = require("../models/Case");
function startEscalationJob() {
    // Runs every day at 08:00 server time
    node_cron_1.default.schedule("0 8 * * *", async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const toEscalate = await Case_1.Case.find({
            status: { $in: ["ASSIGNED", "IN_PROGRESS", "PENDING"] },
            assignedAt: { $lte: sevenDaysAgo },
            escalatedAt: { $exists: false },
        });
        if (toEscalate.length === 0)
            return;
        for (const c of toEscalate) {
            const now = new Date();
            c.status = "ESCALATED";
            c.escalatedAt = now;
            c.reminderSentAt = now;
            c.history.push({
                status: "ESCALATED",
                note: "7-day rule triggered — reminder sent to Case Manager and escalated to Management",
                actor: null,
                createdAt: now,
            });
            await c.save();
            console.log(`Escalation job: reminder+escalation for case ${c.trackingId} assigned to manager ${c.assignedTo}`);
        }
        console.log(`Escalation job: processed ${toEscalate.length} cases`);
    });
}
