import express from "express";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db";
import { CLIENT_ORIGIN, PORT } from "./config/env";
import authRoutes from "./routes/auth";
import caseRoutes from "./routes/cases";
import pollRoutes from "./routes/polls";
import publicRoutes from "./routes/public";
import minutesRoutes from "./routes/minutes";
import analyticsRoutes from "./routes/analytics";
import userRoutes from "./routes/users";
import { startEscalationJob } from "./jobs/escalationJob";

async function bootstrap() {
  await connectDB();

  const app = express();

  app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://neoconnect-ukky.onrender.com",
    ],
    credentials: true,
  })
);
  app.use(express.json());

  const uploadsPath = path.resolve("src/uploads");
  app.use("/uploads", express.static(uploadsPath));

  app.use("/auth", authRoutes);
  app.use("/cases", caseRoutes);
  app.use("/polls", pollRoutes);
  app.use("/public", publicRoutes);
  app.use("/minutes", minutesRoutes);
  app.use("/analytics", analyticsRoutes);
  app.use("/users", userRoutes);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  startEscalationJob();

  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

