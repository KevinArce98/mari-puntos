import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RewardCategory {
  PERSONAL_TIME = 'personal_time',
  ENTERTAINMENT = 'entertainment',
  GIFTS = 'gifts',
  EXPERIENCES = 'experiences',
  PRIVILEGES = 'privileges',
  OTHER = 'other',
}

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RewardCategory,
    default: RewardCategory.OTHER,
  })
  category: RewardCategory;

  @Column({ type: 'int' })
  pointsCost: number;

  @Column({ type: 'int', nullable: true })
  requiredLevel: number;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isCustom: boolean;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'int', default: 0 })
  timesRedeemed: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
