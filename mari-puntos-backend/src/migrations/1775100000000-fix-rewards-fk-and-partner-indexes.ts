import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixRewardsFkAndPartnerIndexes1775100000000 implements MigrationInterface {
  name = 'FixRewardsFkAndPartnerIndexes1775100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change rewards.partnerLinkId FK from NO ACTION to SET NULL
    // so that deleting a PartnerLink nulls out custom rewards instead of throwing
    await queryRunner.query(`
      ALTER TABLE "rewards"
        DROP CONSTRAINT IF EXISTS "FK_rewards_partner_link_id"
    `);

    // Re-create constraint with ON DELETE SET NULL
    await queryRunner.query(`
      ALTER TABLE "rewards"
        ADD CONSTRAINT "FK_rewards_partner_link_id"
        FOREIGN KEY ("partnerLinkId")
        REFERENCES "partner_links"("id")
        ON DELETE SET NULL
    `);

    // Add composite indexes on partner_links for requirePartner middleware
    // which queries WHERE (user1Id = $1 AND status = 'active') OR (user2Id = $1 AND status = 'active')
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_partner_links_user1_status"
        ON "partner_links" ("user1Id", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_partner_links_user2_status"
        ON "partner_links" ("user2Id", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_partner_links_user2_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_partner_links_user1_status"`);

    await queryRunner.query(`
      ALTER TABLE "rewards"
        DROP CONSTRAINT IF EXISTS "FK_rewards_partner_link_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "rewards"
        ADD CONSTRAINT "FK_rewards_partner_link_id"
        FOREIGN KEY ("partnerLinkId")
        REFERENCES "partner_links"("id")
        ON DELETE NO ACTION
    `);
  }
}
