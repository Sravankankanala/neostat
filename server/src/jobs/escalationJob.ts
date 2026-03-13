import cron from "node-cron";
import { Case } from "../models/Case";

export function startEscalationJob() {
  // Runs every day at 08:00 server time
  cron.schedule("0 8 * * *", async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const toEscalate = await Case.find({
      status: { $in: ["ASSIGNED", "IN_PROGRESS", "PENDING"] },
      assignedAt: { $lte: sevenDaysAgo },
      escalatedAt: { $exists: false },
    });

    if (toEscalate.length === 0) return;

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
      console.log(
        `Escalation job: reminder+escalation for case ${c.trackingId} assigned to manager ${c.assignedTo}`
      );
    }

    console.log(`Escalation job: processed ${toEscalate.length} cases`);
  });
}

