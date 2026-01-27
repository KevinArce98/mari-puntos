import type { MigrationInterface, QueryRunner } from "typeorm";

export class PermissionTemplates1769486379000 implements MigrationInterface {
    name = 'PermissionTemplates1769486379000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create permission_templates table
        await queryRunner.query(`
            CREATE TYPE "public"."permission_templates_category_enum" AS ENUM(
                'gaming', 'social', 'sports', 'hobbies', 'entertainment', 'personal_time', 'other'
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE "permission_templates" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "category" "public"."permission_templates_category_enum" NOT NULL DEFAULT 'other',
                "suggestedDurationHours" integer,
                "suggestedPointsCost" integer,
                "isSystemTemplate" boolean NOT NULL DEFAULT false,
                "isActive" boolean NOT NULL DEFAULT true,
                "partnerLinkId" uuid,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_permission_templates" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key for partnerLinkId
        await queryRunner.query(`
            ALTER TABLE "permission_templates" 
            ADD CONSTRAINT "FK_permission_templates_partnerLink" 
            FOREIGN KEY ("partnerLinkId") 
            REFERENCES "partner_links"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        // Modify permissions table
        // 1. Add templateId column
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            ADD COLUMN "templateId" uuid
        `);

        // 2. Drop old type enum
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            DROP COLUMN "type"
        `);

        // 3. Drop old title and description columns
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            DROP COLUMN "title"
        `);

        await queryRunner.query(`
            ALTER TABLE "permissions" 
            DROP COLUMN "description"
        `);

        // 4. Make templateId NOT NULL after data migration (if needed)
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            ALTER COLUMN "templateId" SET NOT NULL
        `);

        // 5. Add foreign key for templateId
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            ADD CONSTRAINT "FK_permissions_template" 
            FOREIGN KEY ("templateId") 
            REFERENCES "permission_templates"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        // 6. Drop old permissions_type_enum if it exists
        await queryRunner.query(`
            DROP TYPE IF EXISTS "public"."permissions_type_enum"
        `);

        // Insert system templates
        await queryRunner.query(`
            INSERT INTO "permission_templates" 
            ("title", "description", "category", "suggestedDurationHours", "suggestedPointsCost", "isSystemTemplate", "metadata") 
            VALUES 
            ('Sesión de Gaming', 'Jugar videojuegos', 'gaming', 2, 50, true, '{"icon": "game-controller-outline"}'),
            ('Salida con Amigos', 'Pasar tiempo con amigos', 'social', 3, 75, true, '{"icon": "people-outline"}'),
            ('Evento Deportivo', 'Ver o asistir a un evento deportivo', 'sports', 4, 100, true, '{"icon": "football-outline"}'),
            ('Noche de Fiesta', 'Salir por la noche', 'entertainment', 4, 100, true, '{"icon": "moon-outline"}'),
            ('Tiempo para Hobbies', 'Dedicar tiempo a pasatiempos personales', 'hobbies', 2, 50, true, '{"icon": "color-palette-outline"}'),
            ('Tiempo Personal', 'Tiempo personal sin estructura', 'personal_time', 2, 40, true, '{"icon": "bed-outline"}')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key from permissions
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            DROP CONSTRAINT "FK_permissions_template"
        `);

        // Remove templateId column from permissions
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            DROP COLUMN "templateId"
        `);

        // Restore old columns
        await queryRunner.query(`
            ALTER TABLE "permissions" 
            ADD COLUMN "title" character varying NOT NULL DEFAULT ''
        `);

        await queryRunner.query(`
            ALTER TABLE "permissions" 
            ADD COLUMN "description" text
        `);

        // Recreate old enum
        await queryRunner.query(`
            CREATE TYPE "public"."permissions_type_enum" AS ENUM(
                'night_out', 'gaming_session', 'sports_event', 'friends_hangout', 'hobby_time', 'other'
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "permissions" 
            ADD COLUMN "type" "public"."permissions_type_enum" NOT NULL DEFAULT 'other'
        `);

        // Drop permission_templates table
        await queryRunner.query(`
            ALTER TABLE "permission_templates" 
            DROP CONSTRAINT "FK_permission_templates_partnerLink"
        `);

        await queryRunner.query(`
            DROP TABLE "permission_templates"
        `);

        await queryRunner.query(`
            DROP TYPE "public"."permission_templates_category_enum"
        `);
    }
}
