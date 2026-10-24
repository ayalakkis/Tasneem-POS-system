-- CreateTable
CREATE TABLE "SalesReturn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesInvoiceId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundAmount" REAL NOT NULL,
    "reason" TEXT,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "SalesReturn_salesInvoiceId_fkey" FOREIGN KEY ("salesInvoiceId") REFERENCES "SalesInvoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SalesReturn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesReturnItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesReturnId" TEXT NOT NULL,
    "salesInvoiceItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "refundAmount" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    CONSTRAINT "SalesReturnItem_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SalesReturnItem_salesInvoiceItemId_fkey" FOREIGN KEY ("salesInvoiceItemId") REFERENCES "SalesInvoiceItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SalesInvoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT,
    "totalAmount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "cashReceived" REAL,
    "changeGiven" REAL,
    "isDelivery" BOOLEAN NOT NULL DEFAULT false,
    "deliveryAddress" TEXT,
    "deliveryStatus" TEXT,
    CONSTRAINT "SalesInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SalesInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SalesInvoice" ("createdById", "customerId", "date", "deliveryAddress", "deliveryStatus", "id", "isDelivery", "totalAmount") SELECT "createdById", "customerId", "date", "deliveryAddress", "deliveryStatus", "id", "isDelivery", "totalAmount" FROM "SalesInvoice";
DROP TABLE "SalesInvoice";
ALTER TABLE "new_SalesInvoice" RENAME TO "SalesInvoice";
CREATE TABLE "new_SalesInvoiceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesInvoiceId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "subtotal" REAL NOT NULL,
    "returnedQuantity" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SalesInvoiceItem_salesInvoiceId_fkey" FOREIGN KEY ("salesInvoiceId") REFERENCES "SalesInvoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SalesInvoiceItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SalesInvoiceItem" ("id", "itemId", "quantity", "salesInvoiceId", "subtotal", "unitCost", "unitPrice") SELECT "id", "itemId", "quantity", "salesInvoiceId", "subtotal", "unitCost", "unitPrice" FROM "SalesInvoiceItem";
DROP TABLE "SalesInvoiceItem";
ALTER TABLE "new_SalesInvoiceItem" RENAME TO "SalesInvoiceItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
