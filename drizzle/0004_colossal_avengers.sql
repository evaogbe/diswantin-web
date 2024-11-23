ALTER TABLE "task" RENAME COLUMN "task_id" TO "client_id";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "user_id" TO "client_id";--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_taskId_unique";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_userId_unique";--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_clientId_unique" UNIQUE("client_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_clientId_unique" UNIQUE("client_id");