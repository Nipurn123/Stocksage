-- CreateTable
CREATE TABLE "DaybookEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DaybookEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DaybookTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DaybookTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DaybookEntryToDaybookTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DaybookEntryToDaybookTag_A_fkey" FOREIGN KEY ("A") REFERENCES "DaybookEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DaybookEntryToDaybookTag_B_fkey" FOREIGN KEY ("B") REFERENCES "DaybookTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DaybookTag_name_userId_key" ON "DaybookTag"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_DaybookEntryToDaybookTag_AB_unique" ON "_DaybookEntryToDaybookTag"("A", "B");

-- CreateIndex
CREATE INDEX "_DaybookEntryToDaybookTag_B_index" ON "_DaybookEntryToDaybookTag"("B");
