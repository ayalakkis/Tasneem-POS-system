/**
 * Nightly database backup for the shop PC.
 *
 *   npm run backup
 *
 * Writes backups/pos-YYYY-MM-DD-HHMM.db and keeps the newest 30.
 *
 * Uses SQLite's VACUUM INTO, which produces a consistent copy even while the
 * shop is open and a sale is being saved. A plain file copy could capture a
 * half-written database.
 */
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const KEEP = 30;
const root = path.resolve(__dirname, "..");
const dir = path.join(root, "backups");

function stamp(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

async function main() {
  mkdirSync(dir, { recursive: true });
  const target = path.join(dir, `pos-${stamp(new Date())}.db`);

  const prisma = new PrismaClient();
  try {
    // SQLite wants a plain string path; forward slashes work on Windows too.
    await prisma.$executeRawUnsafe(`VACUUM INTO '${target.replace(/\\/g, "/").replace(/'/g, "''")}'`);
  } finally {
    await prisma.$disconnect();
  }

  const kb = Math.round(statSync(target).size / 1024);
  console.log(`Backup saved: ${path.relative(root, target)} (${kb} KB)`);

  const old = readdirSync(dir)
    .filter((f) => /^pos-\d{4}-\d{2}-\d{2}-\d{4}\.db$/.test(f))
    .sort()
    .reverse()
    .slice(KEEP);
  for (const f of old) rmSync(path.join(dir, f));
  if (old.length) console.log(`Removed ${old.length} old backup(s); keeping the newest ${KEEP}.`);
}

main().catch((e) => {
  console.error("Backup failed:", e);
  process.exit(1);
});
