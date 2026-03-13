import bcrypt from "bcryptjs";
import { connectDB } from "./config/db";
import { User } from "./models/User";

async function main() {
  await connectDB();

  const email = "admin@neoconnect.local";
  const password = "Admin123!";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin user already exists:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: "NeoConnect Admin",
    email,
    passwordHash,
    role: "ADMIN",
    department: "IT",
  });

  console.log("Created admin user:");
  console.log(" Email:", user.email);
  console.log(" Password:", password);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

