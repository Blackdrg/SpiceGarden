import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRevenueSystemTables1784280713845 implements MigrationInterface {
    name = 'AddRevenueSystemTables1784280713845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.query(`CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "planType" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "monthlyPrice" numeric(10,2) NOT NULL, "quarterlyPrice" numeric(10,2), "annualPrice" numeric(10,2), "defaultBillingCycle" character varying NOT NULL DEFAULT 'monthly', "features" text, "limits" text, "commissionRate" numeric(5,2) NOT NULL DEFAULT '0', "trialDays" integer NOT NULL DEFAULT '0', "gracePeriodDays" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "status" character varying NOT NULL DEFAULT 'active', "sortOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_subscription_plans_planType" UNIQUE ("planType"), CONSTRAINT "PK_subscription_plans_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_subscription_plans_type" ON "subscription_plans" ("planType") `);
        await queryRunner.query(`CREATE INDEX "idx_subscription_plans_status" ON "subscription_plans" ("status") `);

        await queryRunner.query(`CREATE TABLE "restaurant_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "restaurantId" uuid NOT NULL, "planId" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "planType" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'INR', "isTrial" boolean NOT NULL DEFAULT false, "trialStart" TIMESTAMP, "trialEnd" TIMESTAMP, "currentPeriodStart" TIMESTAMP NOT NULL, "currentPeriodEnd" TIMESTAMP NOT NULL, "autoRenew" boolean NOT NULL DEFAULT true, "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false, "cancelledAt" TIMESTAMP, "cancellationReason" character varying, "features" text, "usage" text, "lastPaymentId" character varying, "failedPaymentCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_restaurant_subscriptions_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_restaurant_subscriptions_restaurant_id" ON "restaurant_subscriptions" ("restaurantId") `);
        await queryRunner.query(`CREATE INDEX "idx_restaurant_subscriptions_status" ON "restaurant_subscriptions" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_restaurant_subscriptions_plan_id" ON "restaurant_subscriptions" ("planId") `);

        await queryRunner.query(`CREATE TABLE "customer_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "planId" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "billingCycle" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'INR', "gatewaySubscriptionId" character varying, "paymentMethodId" character varying, "autoRenew" boolean NOT NULL DEFAULT true, "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false, "cancelledAt" TIMESTAMP, "cancellationReason" character varying, "currentPeriodStart" TIMESTAMP NOT NULL, "currentPeriodEnd" TIMESTAMP NOT NULL, "trialStart" TIMESTAMP, "trialEnd" TIMESTAMP, "benefits" text, "lastPaymentId" character varying, "nextPaymentDate" TIMESTAMP, "failedPaymentCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_customer_subscriptions_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_customer_subscriptions_user_id" ON "customer_subscriptions" ("userId") `);
        await queryRunner.query(`CREATE INDEX "idx_customer_subscriptions_status" ON "customer_subscriptions" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_customer_subscriptions_plan_id" ON "customer_subscriptions" ("planId") `);

        await queryRunner.query(`CREATE TABLE "delivery_pricing" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ruleType" character varying NOT NULL, "name" character varying NOT NULL, "pricingType" character varying NOT NULL DEFAULT 'fixed', "basePrice" numeric(10,2) NOT NULL DEFAULT '0', "perKmRate" numeric(10,2), "perMinuteRate" numeric(10,2), "multiplier" numeric(5,2) NOT NULL DEFAULT '1', "minDistanceKm" integer, "maxDistanceKm" integer, "minDeliveryFee" numeric(10,2), "maxDeliveryFee" numeric(10,2), "zonePolygon" text, "applicableDays" character varying array, "startTime" character varying, "endTime" character varying, "validFrom" date, "validTo" date, "conditions" text, "priority" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "metadata" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_delivery_pricing_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_delivery_pricing_rule_type" ON "delivery_pricing" ("ruleType") `);
        await queryRunner.query(`CREATE INDEX "idx_delivery_pricing_active" ON "delivery_pricing" ("isActive") `);
        await queryRunner.query(`CREATE INDEX "idx_delivery_pricing_priority" ON "delivery_pricing" ("priority") `);

        await queryRunner.query(`CREATE TABLE "platform_fees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "feeType" character varying NOT NULL, "applicableTo" character varying NOT NULL, "feeAmount" numeric(10,2) NOT NULL DEFAULT '0', "feePercentage" numeric(5,2), "minAmount" numeric(10,2), "maxAmount" numeric(10,2), "tieredRates" text, "taxableRule" character varying NOT NULL DEFAULT 'taxable', "cityCode" character varying, "stateCode" character varying, "conditions" text, "isActive" boolean NOT NULL DEFAULT true, "priority" integer NOT NULL DEFAULT '0', "metadata" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_platform_fees_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_platform_fees_applicable_to" ON "platform_fees" ("applicableTo") `);
        await queryRunner.query(`CREATE INDEX "idx_platform_fees_active" ON "platform_fees" ("isActive") `);

        await queryRunner.query(`CREATE TABLE "journal_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transactionId" character varying NOT NULL, "entryDate" TIMESTAMP NOT NULL, "accountCode" character varying NOT NULL, "accountName" character varying NOT NULL, "accountType" character varying NOT NULL, "debitAmount" numeric(12,2) NOT NULL, "creditAmount" numeric(12,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'INR', "status" character varying NOT NULL DEFAULT 'draft', "description" character varying NOT NULL, "referenceType" character varying, "referenceId" character varying, "postedBy" character varying, "reversedBy" character varying, "reversedAt" TIMESTAMP, "metadata" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_journal_entries_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_journal_entries_transaction_id" ON "journal_entries" ("transactionId") `);
        await queryRunner.query(`CREATE INDEX "idx_journal_entries_status" ON "journal_entries" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_journal_entries_date" ON "journal_entries" ("entryDate") `);
        await queryRunner.query(`CREATE INDEX "idx_journal_entries_account" ON "journal_entries" ("accountCode") `);

        await queryRunner.query(`CREATE TABLE "campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "campaignType" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'draft', "billingModel" character varying NOT NULL DEFAULT 'flat', "budget" numeric(12,2) NOT NULL, "spentBudget" numeric(12,2) NOT NULL DEFAULT '0', "bidAmount" numeric(12,2), "startDate" date NOT NULL, "endDate" date NOT NULL, "impressions" integer NOT NULL DEFAULT '0', "clicks" integer NOT NULL DEFAULT '0', "conversions" integer NOT NULL DEFAULT '0', "ctr" numeric(5,2), "cpc" numeric(5,2), "targeting" text, "creatives" text, "restaurantId" character varying, "restaurantName" character varying, "dailyStats" text, "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_campaigns_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_campaigns_type" ON "campaigns" ("campaignType") `);
        await queryRunner.query(`CREATE INDEX "idx_campaigns_status" ON "campaigns" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_campaigns_dates" ON "campaigns" ("startDate", "endDate") `);

        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "name" character varying NOT NULL, "displayName" character varying, "status" character varying NOT NULL DEFAULT 'active', "customDomain" character varying, "logoUrl" character varying, "primaryColor" character varying, "supportEmail" character varying, "supportPhone" character varying, "branding" text, "features" text, "settings" text, "billing" text, "isolatedData" boolean NOT NULL DEFAULT false, "maxUsers" integer NOT NULL DEFAULT '0', "maxRestaurants" integer NOT NULL DEFAULT '0', "trialEndsAt" date, "subscriptionEndsAt" date, "ownerUserId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_tenants_slug" UNIQUE ("slug"), CONSTRAINT "PK_tenants_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_tenants_slug" ON "tenants" ("slug") `);
        await queryRunner.query(`CREATE INDEX "idx_tenants_status" ON "tenants" ("status") `);

        await queryRunner.query(`CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "keyHash" character varying(64) NOT NULL, "keyPrefix" character varying(16) NOT NULL, "name" character varying NOT NULL, "description" character varying, "userId" character varying NOT NULL, "tenantId" character varying, "scopes" character varying array NOT NULL, "allowedEndpoints" text, "status" character varying NOT NULL DEFAULT 'active', "usageCount" bigint NOT NULL DEFAULT '0', "dailyLimit" bigint NOT NULL DEFAULT '0', "monthlyLimit" bigint NOT NULL DEFAULT '0', "lastUsedAt" date, "expiresAt" date, "revokedAt" TIMESTAMP, "revokedBy" character varying, "metadata" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_api_keys_key_hash" UNIQUE ("keyHash"), CONSTRAINT "PK_api_keys_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_api_keys_key_hash" ON "api_keys" ("keyHash") `);
        await queryRunner.query(`CREATE INDEX "idx_api_keys_user_id" ON "api_keys" ("userId") `);
        await queryRunner.query(`CREATE INDEX "idx_api_keys_tenant_id" ON "api_keys" ("tenantId") `);

        await queryRunner.query(`CREATE TABLE "bank_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entityType" character varying NOT NULL, "entityId" character varying NOT NULL, "accountHolderName" character varying NOT NULL, "bankName" character varying NOT NULL, "branchName" character varying NOT NULL, "accountNumber" character varying NOT NULL, "ifscCode" character varying NOT NULL, "accountType" character varying, "upiId" character varying, "kycStatus" character varying NOT NULL DEFAULT 'pending', "verificationStatus" character varying NOT NULL DEFAULT 'unverified', "verifiedAt" TIMESTAMP, "verificationId" character varying, "kycDocuments" text, "payoutSettings" text, "isPrimary" boolean NOT NULL DEFAULT true, "isActive" boolean NOT NULL DEFAULT true, "tenantId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bank_accounts_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_bank_accounts_entity_type" ON "bank_accounts" ("entityType", "entityId") `);
        await queryRunner.query(`CREATE INDEX "idx_bank_accounts_kyc_status" ON "bank_accounts" ("kycStatus") `);

        await queryRunner.query(`CREATE TABLE "settlement_reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "settlementType" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "gateway" character varying NOT NULL, "gatewayBatchId" character varying NOT NULL, "totalAmount" numeric(12,2) NOT NULL, "gatewayFee" numeric(12,2), "taxAmount" numeric(12,2), "netAmount" numeric(12,2) NOT NULL DEFAULT '0', "currency" character varying, "payoutId" character varying, "restaurantId" character varying, "driverId" character varying, "settlementDate" date NOT NULL, "processedAt" date, "breakdown" text, "transactions" text, "utr" character varying, "failureReason" character varying, "retryCount" integer NOT NULL DEFAULT '0', "metadata" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_settlement_reports_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_settlement_reports_status" ON "settlement_reports" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_settlement_reports_type" ON "settlement_reports" ("settlementType") `);
        await queryRunner.query(`CREATE INDEX "idx_settlement_reports_date" ON "settlement_reports" ("settlementDate") `);
        await queryRunner.query(`CREATE INDEX "idx_settlement_reports_gateway" ON "settlement_reports" ("gateway") `);

        await queryRunner.query(`ALTER TABLE "restaurant_subscriptions" ADD CONSTRAINT "FK_restaurant_subscriptions_restaurant" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "restaurant_subscriptions" ADD CONSTRAINT "FK_restaurant_subscriptions_plan" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_subscriptions" ADD CONSTRAINT "FK_customer_subscriptions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_subscriptions" ADD CONSTRAINT "FK_customer_subscriptions_plan" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_subscriptions" DROP CONSTRAINT "FK_customer_subscriptions_plan"`);
        await queryRunner.query(`ALTER TABLE "customer_subscriptions" DROP CONSTRAINT "FK_customer_subscriptions_user"`);
        await queryRunner.query(`ALTER TABLE "restaurant_subscriptions" DROP CONSTRAINT "FK_restaurant_subscriptions_plan"`);
        await queryRunner.query(`ALTER TABLE "restaurant_subscriptions" DROP CONSTRAINT "FK_restaurant_subscriptions_restaurant"`);
        await queryRunner.query(`DROP INDEX "public"."idx_settlement_reports_gateway"`);
        await queryRunner.query(`DROP INDEX "public"."idx_settlement_reports_date"`);
        await queryRunner.query(`DROP INDEX "public"."idx_settlement_reports_type"`);
        await queryRunner.query(`DROP INDEX "public"."idx_settlement_reports_status"`);
        await queryRunner.query(`DROP TABLE "settlement_reports"`);
        await queryRunner.query(`DROP INDEX "public"."idx_bank_accounts_kyc_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_bank_accounts_entity_type"`);
        await queryRunner.query(`DROP TABLE "bank_accounts"`);
        await queryRunner.query(`DROP INDEX "public"."idx_api_keys_tenant_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_api_keys_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_api_keys_key_hash"`);
        await queryRunner.query(`DROP TABLE "api_keys"`);
        await queryRunner.query(`DROP INDEX "public"."idx_tenants_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_tenants_slug"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP INDEX "public"."idx_campaigns_dates"`);
        await queryRunner.query(`DROP INDEX "public"."idx_campaigns_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_campaigns_type"`);
        await queryRunner.query(`DROP TABLE "campaigns"`);
        await queryRunner.query(`DROP INDEX "public"."idx_journal_entries_account"`);
        await queryRunner.query(`DROP INDEX "public"."idx_journal_entries_date"`);
        await queryRunner.query(`DROP INDEX "public"."idx_journal_entries_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_journal_entries_transaction_id"`);
        await queryRunner.query(`DROP TABLE "journal_entries"`);
        await queryRunner.query(`DROP INDEX "public"."idx_platform_fees_active"`);
        await queryRunner.query(`DROP INDEX "public"."idx_platform_fees_applicable_to"`);
        await queryRunner.query(`DROP TABLE "platform_fees"`);
        await queryRunner.query(`DROP INDEX "public"."idx_delivery_pricing_priority"`);
        await queryRunner.query(`DROP INDEX "public"."idx_delivery_pricing_active"`);
        await queryRunner.query(`DROP INDEX "public"."idx_delivery_pricing_rule_type"`);
        await queryRunner.query(`DROP TABLE "delivery_pricing"`);
        await queryRunner.query(`DROP INDEX "public"."idx_customer_subscriptions_plan_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_customer_subscriptions_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_customer_subscriptions_user_id"`);
        await queryRunner.query(`DROP TABLE "customer_subscriptions"`);
        await queryRunner.query(`DROP INDEX "public"."idx_restaurant_subscriptions_plan_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_restaurant_subscriptions_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_restaurant_subscriptions_restaurant_id"`);
        await queryRunner.query(`DROP TABLE "restaurant_subscriptions"`);
        await queryRunner.query(`DROP INDEX "public"."idx_subscription_plans_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_subscription_plans_type"`);
        await queryRunner.query(`DROP TABLE "subscription_plans"`);
    }
}
