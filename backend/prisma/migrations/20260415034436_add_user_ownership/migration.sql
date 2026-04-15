-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE INDEX "tasks_user_id_completed_created_at_idx" ON "tasks"("user_id", "completed", "created_at" DESC);

-- CreateIndex
CREATE INDEX "tasks_user_id_created_at_idx" ON "tasks"("user_id", "created_at" DESC);
