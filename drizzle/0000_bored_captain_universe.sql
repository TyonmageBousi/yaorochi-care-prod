CREATE TABLE "asset_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"asset_id" integer NOT NULL,
	"type" smallint NOT NULL,
	"from_storage_id" integer,
	"to_storage_id" integer,
	"from_room_number_id" integer,
	"to_room_number_id" integer,
	"performed_by" integer,
	"performed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "asset_events_type_ck" CHECK ("asset_events"."type" in (1, 2, 3, 4, 5, 6, 7))
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"asset_code" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"serial_number" varchar(128),
	"category_id" integer NOT NULL,
	"current_storage_id" integer NOT NULL,
	"room_number_id" integer,
	"owner" smallint DEFAULT 1 NOT NULL,
	"status" smallint DEFAULT 1 NOT NULL,
	"image_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_owner_ck" CHECK ("assets"."owner" in (1, 2)),
	CONSTRAINT "assets_status_ck" CHECK ("assets"."status" in (1, 2, 3, 4))
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"label" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"item_code" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"unit" integer NOT NULL,
	"status" smallint DEFAULT 1 NOT NULL,
	"par_level" integer,
	"reorder_point" integer,
	"image_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "items_status_ck" CHECK ("items"."status" in (1, 2))
);
--> statement-breakpoint
CREATE TABLE "room_numbers" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"label" varchar(50) NOT NULL,
	"resident_name" varchar(100),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stocktake_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"stock_take_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"system_qty" integer NOT NULL,
	"counted_qty" integer,
	"adjustment_tx_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_take_lines_system_qty_non_neg_ck" CHECK ("stocktake_lines"."system_qty" >= 0),
	CONSTRAINT "stock_take_lines_counted_qty_non_neg_ck" CHECK ("stocktake_lines"."counted_qty" is null OR "stocktake_lines"."counted_qty" >= 0)
);
--> statement-breakpoint
CREATE TABLE "stock_takes" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"storage_id" integer NOT NULL,
	"status" smallint DEFAULT 1 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"posted_at" timestamp with time zone,
	"notes" text,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stocktakes_status_ck" CHECK ("stock_takes"."status" in (1, 2, 3))
);
--> statement-breakpoint
CREATE TABLE "stock_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"type" smallint DEFAULT 1 NOT NULL,
	"qty" integer NOT NULL,
	"storage_id" integer NOT NULL,
	"resident_name" varchar(100),
	"performed_by" integer,
	"performed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_tx_type_ck" CHECK ("stock_transactions"."type" in (1, 2, 3, 4, 5)),
	CONSTRAINT "stock_tx_out_requires_resident_name_ck" CHECK (("stock_transactions"."type" <> 2)
          OR ("stock_transactions"."resident_name" IS NOT NULL AND length("stock_transactions"."resident_name") > 0))
);
--> statement-breakpoint
CREATE TABLE "storage_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"label" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" smallint DEFAULT 3 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"facility_id" integer NOT NULL,
	"phone_number" text NOT NULL,
	"hire_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "users_role_ck" CHECK ("users"."role" in (1, 2, 3))
);
--> statement-breakpoint
ALTER TABLE "stocktake_lines" ADD CONSTRAINT "stocktake_lines_stock_take_id_stock_takes_id_fk" FOREIGN KEY ("stock_take_id") REFERENCES "public"."stock_takes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stocktake_lines" ADD CONSTRAINT "stocktake_lines_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stocktake_lines" ADD CONSTRAINT "stocktake_lines_adjustment_tx_id_stock_transactions_id_fk" FOREIGN KEY ("adjustment_tx_id") REFERENCES "public"."stock_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_takes" ADD CONSTRAINT "stock_takes_storage_id_storage_locations_id_fk" FOREIGN KEY ("storage_id") REFERENCES "public"."storage_locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_events_facility_id_idx" ON "asset_events" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX "asset_events_asset_id_idx" ON "asset_events" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "assets_facility_id_idx" ON "assets" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX "assets_facility_status_idx" ON "assets" USING btree ("facility_id","status");--> statement-breakpoint
CREATE INDEX "assets_facility_category_idx" ON "assets" USING btree ("facility_id","category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assets_facility_asset_code_uq" ON "assets" USING btree ("facility_id","asset_code");--> statement-breakpoint
CREATE INDEX "items_facility_id_idx" ON "items" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX "items_facility_status_idx" ON "items" USING btree ("facility_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "items_facility_item_code_uq" ON "items" USING btree ("facility_id","item_code");--> statement-breakpoint
CREATE INDEX "room_numbers_facility_id_idx" ON "room_numbers" USING btree ("facility_id");--> statement-breakpoint
CREATE UNIQUE INDEX "room_numbers_facility_label_uq" ON "room_numbers" USING btree ("facility_id","label");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_take_lines_stock_take_item_ux" ON "stocktake_lines" USING btree ("stock_take_id","item_id");--> statement-breakpoint
CREATE INDEX "stock_take_lines_stock_take_ix" ON "stocktake_lines" USING btree ("stock_take_id");--> statement-breakpoint
CREATE INDEX "stock_take_lines_item_ix" ON "stocktake_lines" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "stock_take_lines_adjustment_tx_ix" ON "stocktake_lines" USING btree ("adjustment_tx_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stocktakes_one_in_progress_per_storage_ux" ON "stock_takes" USING btree ("facility_id","storage_id") WHERE "stock_takes"."status" = 1;--> statement-breakpoint
CREATE INDEX "stocktakes_facility_storage_status_started_ix" ON "stock_takes" USING btree ("facility_id","storage_id","status","started_at");--> statement-breakpoint
CREATE INDEX "stock_tx_facility_id_idx" ON "stock_transactions" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX "stock_tx_item_id_idx" ON "stock_transactions" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "stock_tx_storage_id_idx" ON "stock_transactions" USING btree ("storage_id");--> statement-breakpoint
CREATE INDEX "users_facility_id_idx" ON "users" USING btree ("facility_id");