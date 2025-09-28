/*
  Warnings:

  - Made the column `assignee` on table `objects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `objects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `objects` required. This step will fail if there are existing NULL values in that column.

*/

-- Update existing NULL values before making columns required
UPDATE "public"."objects" 
SET 
  "assignee" = 'Не указан',
  "startDate" = NOW(),
  "endDate" = NOW() + INTERVAL '30 days'
WHERE "assignee" IS NULL OR "startDate" IS NULL OR "endDate" IS NULL;

-- AlterTable
ALTER TABLE "public"."objects" ALTER COLUMN "assignee" SET NOT NULL,
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL;
