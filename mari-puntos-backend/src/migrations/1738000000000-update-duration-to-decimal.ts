import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDurationToDecimal1738000000000 implements MigrationInterface {
    name = 'UpdateDurationToDecimal1738000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update permissions.durationHours from int to decimal
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            ALTER COLUMN "durationHours" TYPE NUMERIC(5,1)
        `);

        // Update permission_templates.suggestedDurationHours from int to decimal
        await queryRunner.query(`
            ALTER TABLE "permission_templates" 
            ALTER COLUMN "suggestedDurationHours" TYPE NUMERIC(5,1)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert permissions.durationHours to int
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            ALTER COLUMN "durationHours" TYPE INTEGER USING FLOOR("durationHours")
        `);

        // Revert permission_templates.suggestedDurationHours to int
        await queryRunner.query(`
            ALTER TABLE "permission_templates" 
            ALTER COLUMN "suggestedDurationHours" TYPE INTEGER USING FLOOR("suggestedDurationHours")
        `);
    }
}
