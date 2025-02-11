CREATE TABLE "task_path" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_path_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ancestor" integer NOT NULL,
	"descendant" integer NOT NULL,
	"depth" integer NOT NULL,
	CONSTRAINT "task_path_ancestor_descendant_unique" UNIQUE("ancestor","descendant")
);
--> statement-breakpoint
ALTER TABLE "task_path" ADD CONSTRAINT "task_path_ancestor_task_id_fk" FOREIGN KEY ("ancestor") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task_path" ADD CONSTRAINT "task_path_descendant_task_id_fk" FOREIGN KEY ("descendant") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "task_path_descendant_index" ON "task_path" USING btree ("descendant");