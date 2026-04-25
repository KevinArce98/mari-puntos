import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStreakDropRewards1775400000000 implements MigrationInterface {
  name = 'AddStreakDropRewards1775400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "rewards" CASCADE`);

    await queryRunner.query(`
      ALTER TABLE "partner_links"
        ADD COLUMN IF NOT EXISTS "currentStreak" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "longestStreak" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "currentWeekId" varchar NULL,
        ADD COLUMN IF NOT EXISTS "user1WeekDone" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "user2WeekDone" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "partner_links"
        DROP COLUMN IF EXISTS "currentStreak",
        DROP COLUMN IF EXISTS "longestStreak",
        DROP COLUMN IF EXISTS "currentWeekId",
        DROP COLUMN IF EXISTS "user1WeekDone",
        DROP COLUMN IF EXISTS "user2WeekDone"
    `);
  }
}
