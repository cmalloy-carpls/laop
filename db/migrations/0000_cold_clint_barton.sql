CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'view', 'export', 'login', 'logout', 'override');--> statement-breakpoint
CREATE TYPE "public"."conflict_status" AS ENUM('pending-review', 'confirmed', 'cleared', 'overridden');--> statement-breakpoint
CREATE TYPE "public"."conflict_tier" AS ENUM('red', 'orange', 'yellow', 'green');--> statement-breakpoint
CREATE TYPE "public"."match_type" AS ENUM('exact-name', 'alias-name', 'fuzzy-name', 'dob-proximity', 'address', 'compound');--> statement-breakpoint
CREATE TYPE "public"."doc_source" AS ENUM('upload', 'generated', 'received');--> statement-breakpoint
CREATE TYPE "public"."doc_status" AS ENUM('pending', 'ready', 'signed', 'failed', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."eligibility_method" AS ENUM('automated', 'staff-override');--> statement-breakpoint
CREATE TYPE "public"."closure_reason" AS ENUM('service-rendered', 'referred-out', 'client-withdrew', 'ineligible', 'conflict', 'no-show', 'other');--> statement-breakpoint
CREATE TYPE "public"."engagement_status" AS ENUM('intake', 'conflict-check', 'eligible', 'ineligible', 'open', 'closed', 'referred');--> statement-breakpoint
CREATE TYPE "public"."outcome" AS ENUM('favorable', 'unfavorable', 'mixed', 'incomplete', 'pending');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('brief-advice', 'limited-action', 'extended-service', 'full-representation', 'information', 'referral-only');--> statement-breakpoint
CREATE TYPE "public"."funder_type" AS ENUM('lsc', 'iolta', 'state-bar', 'foundation', 'government', 'other');--> statement-breakpoint
CREATE TYPE "public"."atom_type" AS ENUM('topic', 'rule', 'risk', 'decision-gate', 'action-step', 'service-route');--> statement-breakpoint
CREATE TYPE "public"."org_status" AS ENUM('active', 'suspended', 'archived');--> statement-breakpoint
CREATE TYPE "public"."matter_status" AS ENUM('open', 'closed', 'referred-out', 'duplicate');--> statement-breakpoint
CREATE TYPE "public"."party_role" AS ENUM('client', 'opposing', 'witness', 'co-counsel', 'other');--> statement-breakpoint
CREATE TYPE "public"."party_status" AS ENUM('active', 'superseded', 'removed');--> statement-breakpoint
CREATE TYPE "public"."income_period" AS ENUM('annual', 'monthly', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."person_status" AS ENUM('active', 'merged', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('pending', 'accepted', 'declined', 'closed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'staff', 'supervisor', 'readonly');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"user_id" text,
	"action" "audit_action" NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"diff" jsonb,
	"ip_address" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conflicts" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"engagement_id" text NOT NULL,
	"source_party_id" text NOT NULL,
	"matched_party_id" text NOT NULL,
	"tier" "conflict_tier" NOT NULL,
	"match_type" "match_type" NOT NULL,
	"match_score" real NOT NULL,
	"status" "conflict_status" NOT NULL,
	"reviewed_by_user_id" text,
	"reviewed_at" timestamp with time zone,
	"resolution" text,
	"is_cross_org" boolean DEFAULT false NOT NULL,
	"source_organization_id" text,
	"detected_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"matter_id" text,
	"engagement_id" text,
	"label" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"storage_key" text NOT NULL,
	"source" "doc_source" NOT NULL,
	"status" "doc_status" NOT NULL,
	"template_id" text,
	"signature_envelope_id" text,
	"uploaded_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eligibility_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"engagement_id" text NOT NULL,
	"program_id" text NOT NULL,
	"eligible" boolean NOT NULL,
	"reasons" jsonb,
	"income_at_check" bigint,
	"household_size_at_check" integer,
	"poverty_pct_at_check" real,
	"checked_at" timestamp with time zone NOT NULL,
	"checked_by_user_id" text,
	"method" "eligibility_method" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "engagements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"matter_id" text NOT NULL,
	"program_id" text,
	"service_type" "service_type" NOT NULL,
	"status" "engagement_status" NOT NULL,
	"assigned_user_id" text,
	"opened_at" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone,
	"closure_reason" "closure_reason",
	"outcome" "outcome",
	"closure_note" text,
	"lsc_problem_code" text,
	"lsc_subproblem_code" text,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "funders" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "funder_type" NOT NULL,
	"reporting_period_start" timestamp with time zone,
	"reporting_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledge_atoms" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"type" "atom_type" NOT NULL,
	"label" text NOT NULL,
	"body" text NOT NULL,
	"problem_ids" jsonb,
	"parent_ids" jsonb,
	"child_ids" jsonb,
	"tags" jsonb,
	"embedding" vector(1536),
	"embedding_version" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matters" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"person_id" text NOT NULL,
	"problem_id" text,
	"county_fips" text,
	"state_code" text,
	"status" "matter_status" NOT NULL,
	"opened_at" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone,
	"duplicate_of_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" "org_status" NOT NULL,
	"profiles" jsonb,
	"timezone" text,
	"primary_jurisdiction" text,
	"settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parties" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"matter_id" text NOT NULL,
	"person_id" text,
	"role" "party_role" NOT NULL,
	"name_snapshot" jsonb,
	"dob_snapshot" date,
	"status" "party_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "persons" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"primary_name" jsonb,
	"aliases" jsonb,
	"phones" jsonb,
	"email_contacts" jsonb,
	"addresses" jsonb,
	"date_of_birth" date,
	"language" text,
	"household_size" integer,
	"annual_income" bigint,
	"income_period" "income_period",
	"status" "person_status" NOT NULL,
	"merged_into_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "problems" (
	"id" text PRIMARY KEY NOT NULL,
	"lsc_code" text,
	"lsc_subcode" text,
	"label" text NOT NULL,
	"description" text,
	"parent_id" text,
	"is_leaf" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "programs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"funder_id" text,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"source_organization_id" text NOT NULL,
	"source_engagement_id" text NOT NULL,
	"destination_organization_id" text NOT NULL,
	"destination_engagement_id" text,
	"status" "referral_status" NOT NULL,
	"referral_note" text,
	"outcome_note" text,
	"documents_transferred" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"responded_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"sent_by_user_id" text NOT NULL,
	"responded_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"external_auth_id" text,
	"email" text,
	"name" text,
	"role" "user_role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_external_auth_id_unique" UNIQUE("external_auth_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conflicts" ADD CONSTRAINT "conflicts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conflicts" ADD CONSTRAINT "conflicts_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conflicts" ADD CONSTRAINT "conflicts_source_party_id_parties_id_fk" FOREIGN KEY ("source_party_id") REFERENCES "public"."parties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conflicts" ADD CONSTRAINT "conflicts_matched_party_id_parties_id_fk" FOREIGN KEY ("matched_party_id") REFERENCES "public"."parties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conflicts" ADD CONSTRAINT "conflicts_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conflicts" ADD CONSTRAINT "conflicts_source_organization_id_organizations_id_fk" FOREIGN KEY ("source_organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_matter_id_matters_id_fk" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eligibility_checks" ADD CONSTRAINT "eligibility_checks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eligibility_checks" ADD CONSTRAINT "eligibility_checks_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eligibility_checks" ADD CONSTRAINT "eligibility_checks_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eligibility_checks" ADD CONSTRAINT "eligibility_checks_checked_by_user_id_users_id_fk" FOREIGN KEY ("checked_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "engagements" ADD CONSTRAINT "engagements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "engagements" ADD CONSTRAINT "engagements_matter_id_matters_id_fk" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "engagements" ADD CONSTRAINT "engagements_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "engagements" ADD CONSTRAINT "engagements_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "funders" ADD CONSTRAINT "funders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matters" ADD CONSTRAINT "matters_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matters" ADD CONSTRAINT "matters_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matters" ADD CONSTRAINT "matters_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parties" ADD CONSTRAINT "parties_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parties" ADD CONSTRAINT "parties_matter_id_matters_id_fk" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parties" ADD CONSTRAINT "parties_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "persons" ADD CONSTRAINT "persons_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "programs" ADD CONSTRAINT "programs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "programs" ADD CONSTRAINT "programs_funder_id_funders_id_fk" FOREIGN KEY ("funder_id") REFERENCES "public"."funders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referrals" ADD CONSTRAINT "referrals_source_organization_id_organizations_id_fk" FOREIGN KEY ("source_organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referrals" ADD CONSTRAINT "referrals_source_engagement_id_engagements_id_fk" FOREIGN KEY ("source_engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referrals" ADD CONSTRAINT "referrals_destination_organization_id_organizations_id_fk" FOREIGN KEY ("destination_organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referrals" ADD CONSTRAINT "referrals_destination_engagement_id_engagements_id_fk" FOREIGN KEY ("destination_engagement_id") REFERENCES "public"."engagements"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referrals" ADD CONSTRAINT "referrals_sent_by_user_id_users_id_fk" FOREIGN KEY ("sent_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referrals" ADD CONSTRAINT "referrals_responded_by_user_id_users_id_fk" FOREIGN KEY ("responded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parties_org_status_idx" ON "parties" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parties_dob_idx" ON "parties" USING btree ("dob_snapshot");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parties_name_snapshot_gin_idx" ON "parties" USING gin ("name_snapshot");