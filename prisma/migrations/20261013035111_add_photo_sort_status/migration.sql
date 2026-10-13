-- CreateEnum
CREATE TYPE "SortStatus" AS ENUM ('UNSORTED', 'SORTED');

-- AlterTable
ALTER TABLE "Photos" ADD COLUMN     "sort_status" "SortStatus" NOT NULL DEFAULT 'UNSORTED';
