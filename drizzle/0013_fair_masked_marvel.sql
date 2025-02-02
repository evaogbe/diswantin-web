ALTER TABLE "task" DROP CONSTRAINT "task_clientId_unique";--> statement-breakpoint
ALTER TABLE "task_completion" DROP CONSTRAINT "task_completion_doneAt_taskId_unique";--> statement-breakpoint
ALTER TABLE "task_recurrence" DROP CONSTRAINT "task_recurrence_taskId_start_unique";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_clientId_unique";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_googleId_unique";--> statement-breakpoint
DROP INDEX "name_search_index";--> statement-breakpoint
CREATE INDEX "task_name_search_index" ON "task" USING gin (to_tsvector('english', "name"));--> statement-breakpoint
CREATE INDEX "task_user_id_index" ON "task" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_client_id_unique" UNIQUE("client_id");--> statement-breakpoint
ALTER TABLE "task_completion" ADD CONSTRAINT "task_completion_task_id_done_at_unique" UNIQUE("task_id","done_at");--> statement-breakpoint
ALTER TABLE "task_recurrence" ADD CONSTRAINT "task_recurrence_task_id_start_unique" UNIQUE("task_id","start");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_client_id_unique" UNIQUE("client_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_google_id_unique" UNIQUE("google_id");