import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Idempotent: only ensures the demo accounts exist. All catalogue data
// (brands, categories, bike models, products) is created via the admin panel.
async function main() {
  const adminPass  = await bcrypt.hash("admin123",  10);
  const userPass   = await bcrypt.hash("user123",   10);
  const traderPass = await bcrypt.hash("trader123", 10);

  const admin = await db.user.upsert({
    where: { email: "admin@mrkspare.com" },
    update: {},
    create: {
      email: "admin@mrkspare.com",
      name: "Demo Admin",
      password: adminPass,
      role: "ADMIN",
    },
  });

  const user = await db.user.upsert({
    where: { email: "user@mrkspare.com" },
    update: {},
    create: {
      email: "user@mrkspare.com",
      name: "Demo Customer",
      password: userPass,
      role: "USER",
    },
  });

  const trader = await db.user.upsert({
    where: { email: "trader@mrkspare.com" },
    update: { tradeApproved: true },
    create: {
      email: "trader@mrkspare.com",
      name: "Demo Trader",
      password: traderPass,
      role: "USER",
      tradeApproved: true,
      tradeApprovedAt: new Date(),
    },
  });

  console.log("Seed complete.");
  console.log(`  ADMIN  →  ${admin.email}   /  admin123`);
  console.log(`  USER   →  ${user.email}    /  user123`);
  console.log(`  TRADER →  ${trader.email}  /  trader123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
