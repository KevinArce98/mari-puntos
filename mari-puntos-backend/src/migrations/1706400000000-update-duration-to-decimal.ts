import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDurationToDecimal1706400000000 implements MigrationInterface {
    name = 'UpdateDurationToDecimal1706400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Change durationHours in permissions table from int to decimal
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            ALTER COLUMN "durationHours" TYPE DECIMAL(5,1)
        `);

        // Change suggestedDurationHours in permission_templates table from int to decimal
        await queryRunner.query(`
            ALTER TABLE "permission_templates" 
            ALTER COLUMN "suggestedDurationHours" TYPE DECIMAL(5,1)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to int (will lose decimal precision)
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            ALTER COLUMN "durationHours" TYPE INTEGER USING ROUND("durationHours")
        `);

        await queryRunner.query(`
            ALTER TABLE "permission_templates" 
            ALTER COLUMN "suggestedDurationHours" TYPE INTEGER USING ROUND("suggestedDurationHours")
        `);
    }
}
