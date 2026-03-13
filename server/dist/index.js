"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const auth_1 = __importDefault(require("./routes/auth"));
const cases_1 = __importDefault(require("./routes/cases"));
const polls_1 = __importDefault(require("./routes/polls"));
const public_1 = __importDefault(require("./routes/public"));
const minutes_1 = __importDefault(require("./routes/minutes"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const users_1 = __importDefault(require("./routes/users"));
const escalationJob_1 = require("./jobs/escalationJob");
async function bootstrap() {
    await (0, db_1.connectDB)();
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: env_1.CLIENT_ORIGIN,
        credentials: true,
    }));
    app.use(express_1.default.json());
    const uploadsPath = path_1.default.resolve("src/uploads");
    app.use("/uploads", express_1.default.static(uploadsPath));
    app.use("/auth", auth_1.default);
    app.use("/cases", cases_1.default);
    app.use("/polls", polls_1.default);
    app.use("/public", public_1.default);
    app.use("/minutes", minutes_1.default);
    app.use("/analytics", analytics_1.default);
    app.use("/users", users_1.default);
    app.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });
    (0, escalationJob_1.startEscalationJob)();
    app.listen(env_1.PORT, () => {
        console.log(`API server listening on http://localhost:${env_1.PORT}`);
    });
}
bootstrap().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});
