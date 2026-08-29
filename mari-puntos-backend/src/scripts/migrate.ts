import { AppDataSource } from '../config/db';
import { logger } from '../utils/logger';

const MIGRATION_LOCK_KEY = 918273645;

async function runMigrationsWithLock(): Promise<void> {
  await AppDataSource.initialize();

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.query('SET statement_timeout = 0');

    logger.info({ message: 'Acquiring migration advisory lock', key: MIGRATION_LOCK_KEY });
    await queryRunner.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_KEY]);
    logger.info({ message: 'Migration advisory lock acquired', key: MIGRATION_LOCK_KEY });

    const migrations = await AppDataSource.runMigrations();
    logger.info({
      message: 'Migrations executed',
      count: migrations.length,
      names: migrations.map((migration) => migration.name),
    });
  } finally {
    await queryRunner.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_KEY]);
    await queryRunner.release();
  }
}

runMigrationsWithLock()
  .then(() => AppDataSource.destroy())
  .then(() => process.exit(0))
  .catch(async (error) => {
    logger.error({ err: error }, 'Migration run failed');
    await AppDataSource.destroy().catch(() => undefined);
    process.exit(1);
  });
