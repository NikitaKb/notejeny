import { readFile } from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const sql = await readFile(new URL('../prisma/migrations/20260513230000_init/migration.sql', import.meta.url), 'utf8')

for (const statement of sql.split(';').map((item) => item.trim()).filter(Boolean)) {
  const safeStatement = statement
    .replace('CREATE TABLE "User"', 'CREATE TABLE IF NOT EXISTS "User"')
    .replace('CREATE TABLE "Note"', 'CREATE TABLE IF NOT EXISTS "Note"')
    .replace('CREATE UNIQUE INDEX "User_email_key"', 'CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"')
    .replace('CREATE INDEX "Note_userId_pinned_createdAt_idx"', 'CREATE INDEX IF NOT EXISTS "Note_userId_pinned_createdAt_idx"')

  await prisma.$executeRawUnsafe(safeStatement)
}

const columns = await prisma.$queryRawUnsafe('PRAGMA table_info("Note")')
const hasCategory = Array.isArray(columns) && columns.some((column) => column.name === 'category')

if (!hasCategory) {
  await prisma.$executeRawUnsafe('ALTER TABLE "Note" ADD COLUMN "category" TEXT NOT NULL DEFAULT \'personal\'')
}

await prisma.$disconnect()
