-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bookmarkedJobs" TEXT[] DEFAULT ARRAY[]::TEXT[];
