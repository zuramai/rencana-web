CREATE TYPE "public"."cost_frequency" AS ENUM('one_time', 'daily');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('attraction', 'transportation', 'food_beverage', 'accommodation', 'activity', 'shopping', 'event', 'other');--> statement-breakpoint
CREATE TYPE "public"."ticket_kind" AS ENUM('flight', 'train', 'bus', 'ferry', 'attraction', 'event', 'accommodation', 'other');--> statement-breakpoint
CREATE TABLE "expected_costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"name" text NOT NULL,
	"frequency" "cost_frequency" NOT NULL,
	"currency" char(3) NOT NULL,
	"amount" numeric(16, 2) NOT NULL,
	"days" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "costs_days_check" CHECK ("expected_costs"."frequency" = 'daily' or "expected_costs"."days" is null)
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"s3_key" text NOT NULL,
	"thumb_s3_key" text,
	"content_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"original_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itinerary_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"type" "item_type" NOT NULL,
	"description" text NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"currency" char(3),
	"price" numeric(16, 2),
	"note" text,
	"link" text,
	"image_file_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "items_end_after_start_check" CHECK ("itinerary_items"."ends_at" is null or "itinerary_items"."ends_at" >= "itinerary_items"."starts_at"),
	CONSTRAINT "items_price_currency_check" CHECK (("itinerary_items"."currency" is null) = ("itinerary_items"."price" is null))
);
--> statement-breakpoint
CREATE TABLE "plan_fx_rates" (
	"plan_id" uuid NOT NULL,
	"currency" char(3) NOT NULL,
	"rate" numeric(20, 10) NOT NULL,
	"source" text NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL,
	CONSTRAINT "plan_fx_rates_plan_id_currency_pk" PRIMARY KEY("plan_id","currency"),
	CONSTRAINT "fx_source_check" CHECK ("plan_fx_rates"."source" in ('auto', 'manual'))
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"cover_type" text NOT NULL,
	"cover_emoji" text,
	"cover_file_id" uuid,
	"cover_color" text DEFAULT '#D6ECFF' NOT NULL,
	"start_year" smallint,
	"start_month" smallint,
	"end_year" smallint,
	"end_month" smallint,
	"budget_currency" char(3) NOT NULL,
	"budget_amount" numeric(16, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_cover_type_check" CHECK ("plans"."cover_type" in ('emoji', 'image')),
	CONSTRAINT "plans_start_month_check" CHECK ("plans"."start_month" between 1 and 12),
	CONSTRAINT "plans_end_month_check" CHECK ("plans"."end_month" between 1 and 12),
	CONSTRAINT "plans_start_month_year_check" CHECK ("plans"."start_month" is null or "plans"."start_year" is not null),
	CONSTRAINT "plans_end_year_check" CHECK ("plans"."end_year" is null or "plans"."start_year" is not null),
	CONSTRAINT "plans_end_month_year_check" CHECK ("plans"."end_month" is null or "plans"."end_year" is not null)
);
--> statement-breakpoint
CREATE TABLE "ticket_files" (
	"ticket_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "ticket_files_ticket_id_file_id_pk" PRIMARY KEY("ticket_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"kind" "ticket_kind" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location_text" text,
	"location_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text,
	"password_hash" text,
	"google_sub" text,
	"email" text,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"locale" text DEFAULT 'en' NOT NULL,
	"default_currency" char(3) DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_google_sub_unique" UNIQUE("google_sub"),
	CONSTRAINT "users_locale_check" CHECK ("users"."locale" in ('en', 'id')),
	CONSTRAINT "users_identity_check" CHECK ("users"."username" is not null or "users"."google_sub" is not null)
);
--> statement-breakpoint
ALTER TABLE "expected_costs" ADD CONSTRAINT "expected_costs_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_image_file_id_files_id_fk" FOREIGN KEY ("image_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_fx_rates" ADD CONSTRAINT "plan_fx_rates_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_cover_file_id_files_id_fk" FOREIGN KEY ("cover_file_id") REFERENCES "public"."files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_files" ADD CONSTRAINT "ticket_files_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_files" ADD CONSTRAINT "ticket_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "costs_plan_idx" ON "expected_costs" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "items_plan_starts_idx" ON "itinerary_items" USING btree ("plan_id","starts_at");--> statement-breakpoint
CREATE INDEX "plans_user_idx" ON "plans" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "tickets_plan_idx" ON "tickets" USING btree ("plan_id");