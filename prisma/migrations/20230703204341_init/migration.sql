-- CreateTable
CREATE TABLE "Inventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patrimonial_code" TEXT NOT NULL DEFAULT 'S/C',
    "denomination" TEXT NOT NULL,
    "lot" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "dimensions" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "others" TEXT NOT NULL,
    "conservation_state" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "observations" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "register_code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "auth_document" TEXT NOT NULL,
    "unit_organic" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "unit_organic_destiny" TEXT,
    "local_destiny" TEXT,
    "address_destiny" TEXT,
    "responsible_user_document" TEXT NOT NULL,
    "responsible_user_name" TEXT NOT NULL,
    "responsible_user_email" TEXT NOT NULL,
    "destiny_user_document" TEXT NOT NULL,
    "destiny_user_name" TEXT NOT NULL,
    "destiny_user_email" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "details_movement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movement_id" INTEGER NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "details_movement_movement_id_fkey" FOREIGN KEY ("movement_id") REFERENCES "Movement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "details_movement_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "Inventory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
