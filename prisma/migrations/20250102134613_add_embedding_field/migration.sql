/*
  Warnings:

  - Added the required column `embedding` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "embedding" vector(384) NOT NULL;
