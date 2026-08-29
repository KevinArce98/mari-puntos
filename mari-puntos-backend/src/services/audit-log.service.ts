import { DeepPartial, EntityManager } from 'typeorm';

import { AppDataSource } from '../config/db';
import { Log } from '../entities/Log';

export class AuditLogService {
  private logRepository = AppDataSource.getRepository(Log);

  async record(entry: DeepPartial<Log>, manager?: EntityManager): Promise<Log> {
    const repo = manager ? manager.getRepository(Log) : this.logRepository;
    return repo.save(repo.create(entry));
  }

  async recordMany(entries: DeepPartial<Log>[], manager?: EntityManager): Promise<Log[]> {
    const repo = manager ? manager.getRepository(Log) : this.logRepository;
    return repo.save(entries.map((entry) => repo.create(entry)));
  }
}
