-- AlterTable
ALTER TABLE "Convoka" ADD COLUMN     "availableRoles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "hasPaid" BOOLEAN NOT NULL DEFAULT false;
