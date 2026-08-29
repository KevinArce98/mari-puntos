import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserLocale1795000000000 implements MigrationInterface {
  name = 'AddUserLocale1795000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "locale" character varying(5)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "locale"`);
  }
}
