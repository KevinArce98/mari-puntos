import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDb1777471605834 implements MigrationInterface {
    name = 'InitDb1777471605834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."partner_links_status_enum" AS ENUM('pending', 'active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "partner_links" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "linkCode" character varying NOT NULL, "status" "public"."partner_links_status_enum" NOT NULL DEFAULT 'pending', "user1Id" uuid, "user2Id" uuid, "linkedAt" TIMESTAMP, "currentStreak" integer NOT NULL DEFAULT '0', "longestStreak" integer NOT NULL DEFAULT '0', "currentWeekId" character varying, "user1WeekDone" boolean NOT NULL DEFAULT false, "user2WeekDone" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d650a3df76cd2f0f15a69b2afc0" UNIQUE ("linkCode"), CONSTRAINT "REL_77ab731ca027e03259a7a4b76d" UNIQUE ("user1Id"), CONSTRAINT "REL_b052ab3c897027edc2d3fb51f5" UNIQUE ("user2Id"), CONSTRAINT "PK_9b3ad64da16c31b2fe6377fda91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."actions_category_enum" AS ENUM('household', 'childcare', 'errands', 'romantic', 'personal_growth', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."actions_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "actions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "category" "public"."actions_category_enum" NOT NULL DEFAULT 'other', "status" "public"."actions_status_enum" NOT NULL DEFAULT 'pending', "pointsAwarded" integer NOT NULL DEFAULT '0', "approvedBy" uuid, "approvedAt" TIMESTAMP, "rejectionReason" text, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."permission_templates_category_enum" AS ENUM('gaming', 'social', 'sports', 'hobbies', 'entertainment', 'personal_time', 'other')`);
        await queryRunner.query(`CREATE TABLE "permission_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "category" "public"."permission_templates_category_enum" NOT NULL DEFAULT 'other', "suggestedDurationHours" numeric(5,1), "suggestedPointsCost" integer, "isSystemTemplate" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "partnerLinkId" uuid, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_58491c665954fb0fc0f0378e677" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_status_enum" AS ENUM('pending', 'approved', 'rejected', 'expired')`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "templateId" uuid NOT NULL, "requesterId" uuid NOT NULL, "approverId" uuid, "status" "public"."permissions_status_enum" NOT NULL DEFAULT 'pending', "requestedDate" TIMESTAMP NOT NULL, "durationHours" numeric(5,1) NOT NULL, "pointsCost" integer NOT NULL, "respondedAt" TIMESTAMP, "responseMessage" text, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."logs_type_enum" AS ENUM('points_earned', 'points_spent', 'level_up', 'achievement_unlocked', 'permission_requested', 'permission_approved', 'permission_rejected', 'action_created', 'action_approved', 'action_rejected', 'reward_redeemed', 'partner_linked', 'partner_unlinked', 'other')`);
        await queryRunner.query(`CREATE TABLE "logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "type" "public"."logs_type_enum" NOT NULL, "message" text NOT NULL, "pointsChange" integer NOT NULL DEFAULT '0', "relatedEntityId" uuid, "relatedEntityType" character varying, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fb1b805f2f7795de79fa69340ba" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clerkId" character varying NOT NULL, "email" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "avatarUrl" character varying, "totalPoints" integer NOT NULL DEFAULT '0', "currentLevel" integer NOT NULL DEFAULT '1', "pointsInCurrentLevel" integer NOT NULL DEFAULT '0', "partnerCode" character varying, "isActive" boolean NOT NULL DEFAULT true, "pushToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b0e4d1eb939d0387788678c4f8e" UNIQUE ("clerkId"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_c0ea8a8737919839857ab84c3d9" UNIQUE ("partnerCode"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."achievements_type_enum" AS ENUM('points_milestone', 'level_milestone', 'actions_completed', 'permissions_granted', 'streak', 'special')`);
        await queryRunner.query(`CREATE TABLE "achievements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "title" character varying NOT NULL, "description" text, "type" "public"."achievements_type_enum" NOT NULL, "iconUrl" text, "badgeUrl" text, "pointsReward" integer, "isUnlocked" boolean NOT NULL DEFAULT false, "unlockedAt" TIMESTAMP, "requiredValue" integer, "currentProgress" integer NOT NULL DEFAULT '0', "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_achievement_user_type_value" UNIQUE ("userId", "type", "requiredValue"), CONSTRAINT "PK_1bc19c37c6249f70186f318d71d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "levels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "levelNumber" integer NOT NULL, "title" character varying NOT NULL, "description" text, "pointsRequired" integer NOT NULL, "iconUrl" text, "badgeUrl" text, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe433085876fbb63f110c78dfcf" UNIQUE ("levelNumber"), CONSTRAINT "PK_05f8dd8f715793c64d49e3f1901" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "partner_links" ADD CONSTRAINT "FK_77ab731ca027e03259a7a4b76d5" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "partner_links" ADD CONSTRAINT "FK_b052ab3c897027edc2d3fb51f56" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "actions" ADD CONSTRAINT "FK_83a262823d7b54757fa07171b90" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "permission_templates" ADD CONSTRAINT "FK_d1df67e7416d6e7832b7f5f619e" FOREIGN KEY ("partnerLinkId") REFERENCES "partner_links"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD CONSTRAINT "FK_1d5e978b89a4977eec5c17865f5" FOREIGN KEY ("templateId") REFERENCES "permission_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD CONSTRAINT "FK_e0a4d7230c57022b048b5f08501" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD CONSTRAINT "FK_aa1d66bd690f17dfd5f11b3bdb7" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "logs" ADD CONSTRAINT "FK_a1196a1956403417fe3a0343390" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "achievements" ADD CONSTRAINT "FK_a4c9761e826d07a1f4c51ca1d2b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "achievements" DROP CONSTRAINT "FK_a4c9761e826d07a1f4c51ca1d2b"`);
        await queryRunner.query(`ALTER TABLE "logs" DROP CONSTRAINT "FK_a1196a1956403417fe3a0343390"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT "FK_aa1d66bd690f17dfd5f11b3bdb7"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT "FK_e0a4d7230c57022b048b5f08501"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT "FK_1d5e978b89a4977eec5c17865f5"`);
        await queryRunner.query(`ALTER TABLE "permission_templates" DROP CONSTRAINT "FK_d1df67e7416d6e7832b7f5f619e"`);
        await queryRunner.query(`ALTER TABLE "actions" DROP CONSTRAINT "FK_83a262823d7b54757fa07171b90"`);
        await queryRunner.query(`ALTER TABLE "partner_links" DROP CONSTRAINT "FK_b052ab3c897027edc2d3fb51f56"`);
        await queryRunner.query(`ALTER TABLE "partner_links" DROP CONSTRAINT "FK_77ab731ca027e03259a7a4b76d5"`);
        await queryRunner.query(`DROP TABLE "levels"`);
        await queryRunner.query(`DROP TABLE "achievements"`);
        await queryRunner.query(`DROP TYPE "public"."achievements_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "logs"`);
        await queryRunner.query(`DROP TYPE "public"."logs_type_enum"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_status_enum"`);
        await queryRunner.query(`DROP TABLE "permission_templates"`);
        await queryRunner.query(`DROP TYPE "public"."permission_templates_category_enum"`);
        await queryRunner.query(`DROP TABLE "actions"`);
        await queryRunner.query(`DROP TYPE "public"."actions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."actions_category_enum"`);
        await queryRunner.query(`DROP TABLE "partner_links"`);
        await queryRunner.query(`DROP TYPE "public"."partner_links_status_enum"`);
    }

}
