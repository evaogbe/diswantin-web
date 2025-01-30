CREATE TYPE "public"."recurrence_type" AS ENUM('day', 'week', 'day_of_month', 'week_of_month', 'year');--> statement-breakpoint
CREATE TABLE "task_recurrence" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_recurrence_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"task_id" integer NOT NULL,
	"start" date NOT NULL,
	"type" "recurrence_type" NOT NULL,
	"step" integer NOT NULL,
	CONSTRAINT "task_recurrence_taskId_start_unique" UNIQUE("task_id","start")
);
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "task_completion" DROP CONSTRAINT "task_completion_task_id_task_id_fk";
--> statement-breakpoint
ALTER TABLE "task_recurrence" ADD CONSTRAINT "task_recurrence_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task_completion" ADD CONSTRAINT "task_completion_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE cascade;