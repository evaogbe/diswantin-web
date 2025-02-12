CREATE TABLE "task_skip" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_skip_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"skipped_at" timestamp with time zone DEFAULT now() NOT NULL,
	"task_id" integer NOT NULL,
	CONSTRAINT "task_skip_task_id_skipped_at_unique" UNIQUE("task_id","skipped_at")
);
--> statement-breakpoint
ALTER TABLE "task_skip" ADD CONSTRAINT "task_skip_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE cascade;