/**
 * Demo data: adds ~60 days of realistic shop activity on top of whatever is
 * already in the database (it never deletes anything).
 *
 *   npm run db:seed-demo
 *
 * Adds catalog items, customers, supplier purchases, counter sales and
 * delivery orders, keeping stock consistent: purchases are recorded before
 * the sales that need them, and each item's final stock is written back.
 * Runs once; a second run stops because the demo customers already exist.
 */
import { PrismaClient, type DeliveryStatus } from "@prisma/client";

const prisma = new PrismaClient();

// ---------- deterministic randomness (same data every run) ----------
let seed = 20261023;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
function weighted<T>(list: T[], weight: (t: T) => number) {
  const total = list.reduce((s, t) => s + weight(t), 0);
  let r = rand() * total;
  for (const t of list) if ((r -= weight(t)) <= 0) return t;
  return list[list.length - 1];
}

// ---------- catalog ----------
const NEW_ITEMS: Array<{ category: string; name: string; cost: number; price: number }> = [
  { category: "Perfumes", name: "Oud Al Layl 50ml", cost: 45, price: 95 },
  { category: "Perfumes", name: "White Musk Tahara 10ml", cost: 6, price: 15 },
  { category: "Perfumes", name: "Amber Attar 12ml", cost: 12, price: 28 },
  { category: "Perfumes", name: "Bakhoor Sticks Box", cost: 5, price: 12 },
  { category: "Perfumes", name: "Brass Incense Burner", cost: 18, price: 40 },
  { category: "Prayer Items", name: "Amber Misbaha 99 Beads", cost: 22, price: 50 },
  { category: "Prayer Items", name: "Digital Tasbeeh Counter", cost: 3, price: 8 },
  { category: "Prayer Items", name: "Miswak Pack of 3", cost: 1.5, price: 4 },
  { category: "Prayer Items", name: "Qibla Compass", cost: 6, price: 15 },
  { category: "Books", name: "Hisnul Muslim Pocket Edition", cost: 2, price: 6 },
  { category: "Books", name: "Riyad as Salihin", cost: 14, price: 30 },
  { category: "Books", name: "Quran Stories for Children", cost: 10, price: 24 },
  { category: "Books", name: "Arabic Calligraphy Workbook", cost: 5, price: 12 },
  { category: "Clothing", name: "Embroidered Kufi Cap", cost: 5, price: 14 },
  { category: "Clothing", name: "Classic Black Abaya", cost: 35, price: 80 },
  { category: "Clothing", name: "Jersey Hijab", cost: 4, price: 12 },
  { category: "Clothing", name: "Children's Thobe", cost: 14, price: 32 },
  { category: "prayer mats", name: "Travel Prayer Mat", cost: 6, price: 15 },
  { category: "prayer mats", name: "Kids Prayer Mat", cost: 8, price: 18 },
  { category: "prayer mats", name: "Memory Foam Prayer Mat", cost: 28, price: 60 },
  { category: "table covers", name: "Embroidered Quran Table Cover", cost: 9, price: 22 },
  { category: "law7a", name: "Ayat al Kursi Wall Art", cost: 25, price: 60 },
  { category: "law7a", name: "Bismillah Canvas Small", cost: 12, price: 30 },
];

// Left to run down (never restocked) so low stock shows up in the app.
const RUNNING_LOW = new Set(["Amber Misbaha 99 Beads", "Rose Attar 6ml", "Memory Foam Prayer Mat"]);

const CUSTOMERS: Array<[string, string]> = [
  ["Hussein Fadlallah", "70412778"],
  ["Zeinab Hamdan", "71233590"],
  ["Mohammad Haidar", "76118842"],
  ["Fatima Zaher", "03556120"],
  ["Ali Nasrallah", "70981204"],
  ["Maryam Khalil", "71640087"],
  ["Hassan Mroueh", "76302915"],
  ["Batoul Sabra", "03774461"],
  ["Abbas Kassem", "70265538"],
  ["Rayan Itani", "71890326"],
  ["Nour Saad", "76457019"],
  ["Ibrahim Jaber", "03129874"],
  ["Layal Hammoud", "70738652"],
  ["Karim Daher", "71512403"],
  ["Sara Shams", "76924170"],
  ["Youssef Ayoub", "03681259"],
  ["Hiba Yassine", "70347716"],
  ["Jaafar Moussa", "71206984"],
];
const MARKER_PHONE = CUSTOMERS[0][1];

const ADDRESSES = [
  "Haret Hreik, Main Street, Building 12, 3rd floor",
  "Ghobeiry, near Al Rida Mosque",
  "Bir Hassan, Tannoury Street, Building 4",
  "Hamra, Bliss Street, Apartment 7",
  "Choueifat, Amrousieh, next to the pharmacy",
  "Tyre, Hosh, Al Bass Road",
  "Nabatieh, Kfar Remen, main square",
  "Baalbek, Ras el Ein, opposite the school",
  "Saida, Abra, Building 21",
  "Khalde, old road, Villa Haidar",
];

const SUPPLIERS = ["Al Noor Trading", "Dar Al Salam Books", "Oud House", "Beirut Textiles", "Hikma Imports"];
const SUPPLIER_FOR: Record<string, string> = {
  Perfumes: "Oud House",
  Books: "Dar Al Salam Books",
  Clothing: "Beirut Textiles",
};

// ---------- helpers ----------
const DAY = 86_400_000;
const today = new Date();
today.setHours(0, 0, 0, 0);

function at(daysAgo: number, hour: number, minute = int(0, 59)) {
  const d = new Date(today.getTime() - daysAgo * DAY);
  d.setHours(hour, minute, int(0, 59), 0);
  return d;
}

type Item = { id: string; name: string; categoryName: string; cost: number; price: number; stock: number };

async function main() {
  if (await prisma.customer.findFirst({ where: { phone: MARKER_PHONE } })) {
    console.log("Demo data is already in this database. Nothing to do.");
    return;
  }

  const users = await prisma.user.findMany();
  const admin = users.find((u) => u.role === "ADMIN") ?? users[0];
  const cashiers = users.filter((u) => u.role === "EMPLOYEE");
  const staff = cashiers.length ? cashiers : [admin];

  // Categories (reuse existing ones by name, create any that are missing)
  const categories = new Map((await prisma.category.findMany()).map((c) => [c.name, c.id]));
  for (const name of new Set(NEW_ITEMS.map((i) => i.category))) {
    if (!categories.has(name)) {
      const c = await prisma.category.create({ data: { name } });
      categories.set(name, c.id);
    }
  }

  // Items: new ones start at 0 and get an opening purchase
  const existing = await prisma.item.findMany({ include: { category: true } });
  const items: Item[] = existing.map((i) => ({
    id: i.id,
    name: i.name,
    categoryName: i.category.name,
    cost: i.costPrice,
    price: i.sellingPrice,
    stock: i.quantityInStock,
  }));
  const takenBarcodes = new Set(existing.map((i) => i.barcode).filter(Boolean));
  let barcode = 6291041500400;
  for (const def of NEW_ITEMS) {
    if (existing.some((i) => i.name === def.name)) continue;
    while (takenBarcodes.has(String(barcode))) barcode += 7;
    const created = await prisma.item.create({
      data: {
        name: def.name,
        barcode: String(barcode),
        categoryId: categories.get(def.category)!,
        costPrice: def.cost,
        sellingPrice: def.price,
        quantityInStock: 0,
        createdAt: at(64, 9),
      },
    });
    barcode += 7;
    items.push({ id: created.id, name: def.name, categoryName: def.category, cost: def.cost, price: def.price, stock: 0 });
  }

  const customers = [];
  for (const [i, [name, phone]] of CUSTOMERS.entries()) {
    customers.push(
      await prisma.customer.create({ data: { name, phone, createdAt: at(62 - i * 2, 11) } }),
    );
  }
  const allCustomers = [...customers, ...(await prisma.customer.findMany({ where: { phone: { notIn: CUSTOMERS.map((c) => c[1]) } } }))];

  // ---------- build the event timeline in memory ----------
  type PurchaseEv = { kind: "purchase"; date: Date; item: Item; qty: number };
  type SaleEv = {
    kind: "sale";
    date: Date;
    lines: Array<{ item: Item; qty: number }>;
    customerId: string | null;
    userId: string;
    delivery?: { address: string; status: DeliveryStatus };
  };
  const purchases: PurchaseEv[] = [];
  const sales: SaleEv[] = [];

  for (const item of items) {
    if (item.stock < 8) purchases.push({ kind: "purchase", date: at(61, 10), item, qty: int(14, 24) });
  }

  const nowHour = new Date().getHours();
  for (let daysAgo = 59; daysAgo >= 0; daysAgo--) {
    const weekday = new Date(today.getTime() - daysAgo * DAY).getDay();
    let count = int(4, 9);
    if (weekday === 5) count = Math.round(count * 1.7); // Friday rush
    if (weekday === 0) count = Math.max(2, count - 3); // quiet Sunday

    for (let n = 0; n < count; n++) {
      const hour = int(10, 20);
      if (daysAgo === 0 && hour >= nowHour) continue; // nothing in the future
      const lineCount = weighted([1, 2, 3, 4], (k) => [6, 4, 2, 1][k - 1]);
      const chosen = new Set<Item>();
      while (chosen.size < lineCount) chosen.add(weighted(items, (i) => 60 / (i.price + 10))); // cheap items sell more
      sales.push({
        kind: "sale",
        date: at(daysAgo, hour),
        lines: [...chosen].map((item) => ({ item, qty: item.price < 15 && rand() < 0.3 ? int(2, 3) : 1 })),
        customerId: rand() < 0.45 ? pick(allCustomers).id : null,
        userId: rand() < 0.12 ? admin.id : pick(staff).id,
      });
    }

    // Delivery orders: about two every three days in the last month
    if (daysAgo <= 30 && rand() < 0.66) {
      const status: DeliveryStatus =
        daysAgo === 0 ? "PENDING" : daysAgo <= 2 ? pick(["PENDING", "OUT_FOR_DELIVERY"] as const) : rand() < 0.15 ? "CANCELLED" : "DELIVERED";
      const chosen = new Set<Item>();
      const lines = int(1, 3);
      while (chosen.size < lines) chosen.add(pick(items));
      sales.push({
        kind: "sale",
        date: at(daysAgo, daysAgo === 0 ? Math.max(9, nowHour - 2) : int(11, 18)),
        lines: [...chosen].map((item) => ({ item, qty: 1 })),
        customerId: pick(customers).id,
        userId: pick(staff).id,
        delivery: { address: pick(ADDRESSES), status },
      });
    }
  }
  sales.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Walk the timeline: restock before a sale would oversell, except for the
  // "running low" items, which simply sell out.
  for (const p of purchases) p.item.stock += p.qty;
  for (const sale of sales) {
    const cancelled = sale.delivery?.status === "CANCELLED";
    sale.lines = sale.lines.filter((line) => {
      if (line.item.stock >= line.qty) return true;
      if (RUNNING_LOW.has(line.item.name)) return false;
      const qty = int(15, 30);
      purchases.push({ kind: "purchase", date: new Date(sale.date.getTime() - int(1, 3) * DAY), item: line.item, qty });
      line.item.stock += qty;
      return true;
    });
    if (!cancelled) for (const line of sale.lines) line.item.stock -= line.qty;
  }

  // ---------- write ----------
  await prisma.$transaction(
    async (tx) => {
      for (const p of purchases) {
        await tx.purchaseInvoice.create({
          data: {
            itemId: p.item.id,
            quantity: p.qty,
            unitCost: p.item.cost,
            totalPaid: Math.round(p.item.cost * p.qty * (rand() < 0.2 ? 0.95 : 1) * 100) / 100,
            supplier: SUPPLIER_FOR[p.item.categoryName] ?? pick(SUPPLIERS),
            date: p.date,
            createdById: admin.id,
          },
        });
      }

      for (const sale of sales) {
        if (sale.lines.length === 0) continue;
        const lines = sale.lines.map(({ item, qty }) => ({
          itemId: item.id,
          quantity: qty,
          unitPrice: item.price,
          unitCost: item.cost,
          subtotal: item.price * qty,
        }));
        await tx.salesInvoice.create({
          data: {
            customerId: sale.customerId,
            totalAmount: lines.reduce((s, l) => s + l.subtotal, 0),
            date: sale.date,
            createdById: sale.userId,
            isDelivery: Boolean(sale.delivery),
            deliveryAddress: sale.delivery?.address ?? null,
            deliveryStatus: sale.delivery?.status ?? null,
            items: { create: lines },
          },
        });
      }

      for (const item of items) {
        await tx.item.update({ where: { id: item.id }, data: { quantityInStock: Math.max(0, item.stock) } });
      }
    },
    { timeout: 120_000 },
  );

  const written = sales.filter((s) => s.lines.length > 0);
  console.log("Demo data added:");
  console.log(`  items       +${NEW_ITEMS.length}`);
  console.log(`  customers   +${customers.length}`);
  console.log(`  purchases   +${purchases.length}`);
  console.log(`  sales       +${written.filter((s) => !s.delivery).length}`);
  console.log(`  deliveries  +${written.filter((s) => s.delivery).length}`);
  console.log(`  low stock   ${items.filter((i) => i.stock < 5).map((i) => `${i.name} (${i.stock})`).join(", ") || "none"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
