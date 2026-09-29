import { prisma } from "@/lib/prisma";

const PREFIX = "MRK";
// Human-readable orders start at MRK1000 and count up.
const START = 1000;

// Advisory lock key — any constant int. Serializes order-number generation
// across concurrent transactions so two simultaneous orders can't pick the
// same number.
const LOCK_KEY = 7723184501;

type Tx = Pick<typeof prisma, "order" | "$executeRaw">;

/**
 * Allocates the next human-readable order number ("MRK1000", "MRK1001"…).
 * Must be called inside a transaction — uses a Postgres advisory lock so two
 * callers can't both read the same MAX(seq).
 *
 * We scan all existing MRK-prefixed numbers and compute the max numerically
 * (rather than relying on a string ORDER BY, which would order "MRK9999"
 * higher than "MRK10000" and miscount at every digit-count boundary).
 */
export async function nextOrderNumber(tx: Tx): Promise<string> {
  // Lock for the duration of the surrounding transaction. Use $executeRaw —
  // pg_advisory_xact_lock returns void, which $queryRaw can't deserialize.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${LOCK_KEY})`;

  const rows = await tx.order.findMany({
    where: { orderNumber: { startsWith: PREFIX } },
    select: { orderNumber: true },
  });
  let maxSeq = START - 1;
  for (const r of rows) {
    if (!r.orderNumber) continue;
    const n = parseInt(r.orderNumber.slice(PREFIX.length), 10);
    if (Number.isFinite(n) && n > maxSeq) maxSeq = n;
  }
  return `${PREFIX}${maxSeq + 1}`;
}
