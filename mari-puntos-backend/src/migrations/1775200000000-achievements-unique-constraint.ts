import { MigrationInterface, QueryRunner } from 'typeorm';

export class AchievementsUniqueConstraint1775200000000 implements MigrationInterface {
  name = 'AchievementsUniqueConstraint1775200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove duplicate unlocked achievements before adding unique constraint
    // Keep the earliest unlocked row per (userId, type, requiredValue)
    await queryRunner.query(`
      DELETE FROM achievements a
      USING (
        SELECT MIN(id::text) AS keep_id, "userId", type, "requiredValue"
        FROM achievements
        GROUP BY "userId", type, "requiredValue"
        HAVING COUNT(*) > 1
      ) dups
      WHERE a."userId" = dups."userId"
        AND a.type = dups.type
        AND (a."requiredValue" = dups."requiredValue" OR (a."requiredValue" IS NULL AND dups."requiredValue" IS NULL))
        AND a.id::text <> dups.keep_id
    `);

    await queryRunner.query(`
      ALTER TABLE achievements
      ADD CONSTRAINT "UQ_achievement_user_type_value"
      UNIQUE ("userId", type, "requiredValue")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE achievements
      DROP CONSTRAINT IF EXISTS "UQ_achievement_user_type_value"
    `);
  }
}
