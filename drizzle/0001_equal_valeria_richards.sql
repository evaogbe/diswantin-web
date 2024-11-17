ALTER TABLE "task" ADD COLUMN "task_id" char(11) NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_taskId_unique" UNIQUE("task_id");