CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

ALTER TABLE "tasks"
ADD COLUMN "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN "due_date" TIMESTAMP(3);

CREATE INDEX "tasks_user_id_priority_due_date_idx" ON "tasks"("user_id", "priority", "due_date");
