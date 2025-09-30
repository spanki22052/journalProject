-- AlterTable
ALTER TABLE "public"."chat_messages" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileUrl" TEXT;
