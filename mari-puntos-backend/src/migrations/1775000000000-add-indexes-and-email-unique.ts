import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesAndEmailUnique1775000000000 implements MigrationInterface {
  name = 'AddIndexesAndEmailUnique1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Unique constraint on users.email (with conflict handling for existing duplicates)
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")`
    );

    // Actions
    await queryRunner.query(
      `CREATE INDEX "IDX_actions_userId_createdAt" ON "actions" ("userId", "createdAt" DESC)`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_actions_status" ON "actions" ("status")`
    );

    // Permissions
    await queryRunner.query(
      `CREATE INDEX "IDX_permissions_requesterId_createdAt" ON "permissions" ("requesterId", "createdAt" DESC)`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_permissions_status" ON "permissions" ("status")`
    );

    // Logs
    await queryRunner.query(
      `CREATE INDEX "IDX_logs_userId_createdAt" ON "logs" ("userId", "createdAt" DESC)`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_logs_type" ON "logs" ("type")`
    );

    // Achievements
    await queryRunner.query(
      `CREATE INDEX "IDX_achievements_userId_isUnlocked" ON "achievements" ("userId", "isUnlocked")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_achievements_userId_isUnlocked"`);
    await queryRunner.query(`DROP INDEX "IDX_logs_type"`);
    await queryRunner.query(`DROP INDEX "IDX_logs_userId_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_permissions_status"`);
    await queryRunner.query(`DROP INDEX "IDX_permissions_requesterId_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_actions_status"`);
    await queryRunner.query(`DROP INDEX "IDX_actions_userId_createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_email"`
    );
  }
}
