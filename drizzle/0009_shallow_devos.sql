CREATE TABLE IF NOT EXISTS "task_completion" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_completion_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"done_at" timestamp with time zone DEFAULT now() NOT NULL,
	"task_id" integer NOT NULL,
	CONSTRAINT "task_completion_doneAt_taskId_unique" UNIQUE("done_at","task_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_completion" ADD CONSTRAINT "task_completion_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
