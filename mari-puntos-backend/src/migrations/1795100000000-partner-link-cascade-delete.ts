import { MigrationInterface, QueryRunner } from 'typeorm';

export class PartnerLinkCascadeDelete1795100000000 implements MigrationInterface {
  name = 'PartnerLinkCascadeDelete1795100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permission_templates" DROP CONSTRAINT "FK_d1df67e7416d6e7832b7f5f619e"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_templates" ADD CONSTRAINT "FK_d1df67e7416d6e7832b7f5f619e" FOREIGN KEY ("partnerLinkId") REFERENCES "partner_links"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_1d5e978b89a4977eec5c17865f5"`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_1d5e978b89a4977eec5c17865f5" FOREIGN KEY ("templateId") REFERENCES "permission_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_1d5e978b89a4977eec5c17865f5"`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_1d5e978b89a4977eec5c17865f5" FOREIGN KEY ("templateId") REFERENCES "permission_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_templates" DROP CONSTRAINT "FK_d1df67e7416d6e7832b7f5f619e"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_templates" ADD CONSTRAINT "FK_d1df67e7416d6e7832b7f5f619e" FOREIGN KEY ("partnerLinkId") REFERENCES "partner_links"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
