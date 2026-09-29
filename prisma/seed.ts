import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const db = new PrismaClient();

// Idempotent: only ensures the demo accounts exist. All catalogue data
// (brands, categories, bike models, products) is created via the admin panel.
async function main() {
  // Passwords come from .env (SEED_ADMIN_PASSWORD, SEED_USER_PASSWORD,
  // SEED_TRADER_PASSWORD) so none are committed. Missing ones get a random
  // password, printed once below. Existing accounts are never changed.
  const pw = (key: string) => process.env[key] || randomBytes(9).toString("base64url");
  const adminPlain  = pw("SEED_ADMIN_PASSWORD");
  const userPlain   = pw("SEED_USER_PASSWORD");
  const traderPlain = pw("SEED_TRADER_PASSWORD");
  const adminPass  = await bcrypt.hash(adminPlain,  10);
  const userPass   = await bcrypt.hash(userPlain,   10);
  const traderPass = await bcrypt.hash(traderPlain, 10);

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
  console.log(`  ADMIN  →  ${admin.email}   /  ${adminPlain}`);
  console.log(`  USER   →  ${user.email}    /  ${userPlain}`);
  console.log(`  TRADER →  ${trader.email}  /  ${traderPlain}`);
  console.log("  (passwords apply only to accounts created by this run)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
