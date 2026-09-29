/**
 * One-shot migration: uploads every image still referenced by a local dev
 * path (`/uploads/<file>`) to Vercel Blob, then rewrites those paths in the
 * database to the new public Blob URLs.
 *
 * Scans every text / text[] column in the public schema, so product images,
 * category images, brand logos, wishlist snapshots etc. are all covered.
 *
 * Usage (from the project root). Blob auth is either BLOB_READ_WRITE_TOKEN,
 * or BLOB_STORE_ID + VERCEL_OIDC_TOKEN (from `vercel env pull .env.vercel`):
 *
 *   TARGET_DATABASE_URL="postgresql://..." \
 *     npx tsx --env-file=.env --env-file=.env.vercel scripts/migrate-local-images-to-blob.ts
 *
 * Idempotent — a file already uploaded keeps the same Blob pathname
 * (`mrk-spare/<file>`), and rows no longer holding `/uploads/` are skipped.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { head, put } from "@vercel/blob";

const DB_URL = process.env.TARGET_DATABASE_URL;
if (
  !process.env.BLOB_READ_WRITE_TOKEN &&
  !(process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
) {
  console.error("Missing Blob credentials: BLOB_READ_WRITE_TOKEN, or BLOB_STORE_ID + VERCEL_OIDC_TOKEN.");
  process.exit(1);
}
if (!DB_URL) {
  console.error("Missing TARGET_DATABASE_URL.");
  process.exit(1);
}

const db = new PrismaClient({ datasources: { db: { url: DB_URL } } });
const PREFIX = "/uploads/";
const uploaded = new Map<string, string>();

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif", ".svg": "image/svg+xml",
};

async function toBlobUrl(local: string): Promise<string> {
  const file = local.slice(PREFIX.length).split("?")[0];
  const cached = uploaded.get(file);
  if (cached) return cached;
  const pathname = `mrk-spare/${file}`;
  let url: string;
  try {
    url = (await head(pathname)).url;
  } catch {
    const bytes = await readFile(path.join(process.cwd(), "public", "uploads", file));
    const blob = await put(pathname, bytes, {
      access: "public",
      addRandomSuffix: false,
      contentType: MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
      cacheControlMaxAge: 31536000,
    });
    url = blob.url;
    console.log(`  uploaded ${file}`);
  }
  uploaded.set(file, url);
  return url;
}

async function main() {
  const cols = await db.$queryRawUnsafe<{ table_name: string; column_name: string; data_type: string }[]>(
    `select table_name, column_name, data_type from information_schema.columns
     where table_schema = 'public'
       and (data_type = 'text' or (data_type = 'ARRAY' and udt_name = '_text'))
       and table_name in (select table_name from information_schema.columns
                          where table_schema = 'public' and column_name = 'id')`,
  );

  let rows = 0;
  for (const { table_name: t, column_name: c, data_type } of cols) {
    const isArray = data_type === "ARRAY";
    const where = isArray
      ? `exists (select 1 from unnest("${c}") v where v like '${PREFIX}%')`
      : `"${c}" like '${PREFIX}%'`;
    const hits = await db.$queryRawUnsafe<{ id: string; val: string | string[] }[]>(
      `select id::text as id, "${c}" as val from "${t}" where ${where}`,
    );
    for (const { id, val } of hits) {
      if (isArray) {
        const next = await Promise.all(
          (val as string[]).map((v) => (v.startsWith(PREFIX) ? toBlobUrl(v) : v)),
        );
        await db.$executeRawUnsafe(`update "${t}" set "${c}" = $1::text[] where id::text = $2`, next, id);
      } else {
        const next = await toBlobUrl(val as string);
        await db.$executeRawUnsafe(`update "${t}" set "${c}" = $1 where id::text = $2`, next, id);
      }
      rows++;
      console.log(`${t}.${c} ${id}`);
    }
  }
  console.log(`\nDone: ${uploaded.size} files, ${rows} rows updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
