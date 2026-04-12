import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fixes FK cascade behavior on user deletion:
 * - actions.userId → CASCADE (user owns their actions)
 * - logs.userId → CASCADE (user audit trail)
 * - achievements.userId → CASCADE (user-private data)
 * - permissions.requesterId → SET NULL (keep history)
 * - permissions.approverId → SET NULL (keep history)
 */
export class FixUserFkCascades1775300000000 implements MigrationInterface {
  name = 'FixUserFkCascades1775300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // actions.userId
    await queryRunner.query(`ALTER TABLE actions DROP CONSTRAINT IF EXISTS "FK_actions_userId"`);
    await queryRunner.query(`
      ALTER TABLE actions
      ADD CONSTRAINT "FK_actions_userId"
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
    `);

    // logs.userId
    await queryRunner.query(`ALTER TABLE logs DROP CONSTRAINT IF EXISTS "FK_logs_userId"`);
    await queryRunner.query(`
      ALTER TABLE logs
      ADD CONSTRAINT "FK_logs_userId"
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
    `);

    // achievements.userId
    await queryRunner.query(`ALTER TABLE achievements DROP CONSTRAINT IF EXISTS "FK_achievements_userId"`);
    await queryRunner.query(`
      ALTER TABLE achievements
      ADD CONSTRAINT "FK_achievements_userId"
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
    `);

    // permissions.requesterId
    await queryRunner.query(`ALTER TABLE permissions DROP CONSTRAINT IF EXISTS "FK_permissions_requesterId"`);
    await queryRunner.query(`
      ALTER TABLE permissions
      ADD CONSTRAINT "FK_permissions_requesterId"
      FOREIGN KEY ("requesterId") REFERENCES users(id) ON DELETE SET NULL
    `);

    // permissions.approverId
    await queryRunner.query(`ALTER TABLE permissions DROP CONSTRAINT IF EXISTS "FK_permissions_approverId"`);
    await queryRunner.query(`
      ALTER TABLE permissions
      ADD CONSTRAINT "FK_permissions_approverId"
      FOREIGN KEY ("approverId") REFERENCES users(id) ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to no explicit cascade (TypeORM default: RESTRICT)
    const tables = [
      { table: 'actions', col: 'userId', constraint: 'FK_actions_userId' },
      { table: 'logs', col: 'userId', constraint: 'FK_logs_userId' },
      { table: 'achievements', col: 'userId', constraint: 'FK_achievements_userId' },
      { table: 'permissions', col: 'requesterId', constraint: 'FK_permissions_requesterId' },
      { table: 'permissions', col: 'approverId', constraint: 'FK_permissions_approverId' },
    ];

    for (const { table, constraint } of tables) {
      await queryRunner.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS "${constraint}"`);
    }
  }
}
