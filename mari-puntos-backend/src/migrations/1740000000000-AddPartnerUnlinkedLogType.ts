import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPartnerUnlinkedLogType1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."logs_type_enum" ADD VALUE IF NOT EXISTS 'partner_unlinked'`
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing values from an enum directly.
    // A full enum recreation is required if rollback is needed.
    // This is intentionally left as a no-op to avoid data loss.
  }
}
