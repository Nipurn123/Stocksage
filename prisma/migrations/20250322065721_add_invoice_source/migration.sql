/*
  Warnings:

  - Added the required column `lastUpdated` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "totalAmount" REAL NOT NULL,
    "taxAmount" REAL,
    "discountAmount" REAL,
    "paymentTerms" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "confidenceScore" REAL,
    "stripeInvoiceId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "pdfUrl" TEXT,
    "isCompliant" BOOLEAN NOT NULL DEFAULT false,
    "complianceNotes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "lastUpdated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("complianceNotes", "confidenceScore", "createdAt", "customerId", "date", "discountAmount", "dueDate", "id", "invoiceNumber", "isCompliant", "notes", "paymentStatus", "paymentTerms", "pdfUrl", "status", "stripeInvoiceId", "taxAmount", "totalAmount", "updatedAt") SELECT "complianceNotes", "confidenceScore", "createdAt", "customerId", "date", "discountAmount", "dueDate", "id", "invoiceNumber", "isCompliant", "notes", "paymentStatus", "paymentTerms", "pdfUrl", "status", "stripeInvoiceId", "taxAmount", "totalAmount", "updatedAt" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_stripeInvoiceId_key" ON "Invoice"("stripeInvoiceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
