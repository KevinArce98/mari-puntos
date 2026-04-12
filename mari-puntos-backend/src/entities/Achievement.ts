import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './User';

export enum AchievementType {
  POINTS_MILESTONE = 'points_milestone',
  LEVEL_MILESTONE = 'level_milestone',
  ACTIONS_COMPLETED = 'actions_completed',
  PERMISSIONS_GRANTED = 'permissions_granted',
  STREAK = 'streak',
  SPECIAL = 'special',
}

@Entity('achievements')
@Unique('UQ_achievement_user_type_value', ['userId', 'type', 'requiredValue'])
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AchievementType,
  })
  type: AchievementType;

  @Column({ type: 'text', nullable: true })
  iconUrl: string;

  @Column({ type: 'text', nullable: true })
  badgeUrl: string;

  @Column({ type: 'int', nullable: true })
  pointsReward: number;

  @Column({ type: 'boolean', default: false })
  isUnlocked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  unlockedAt: Date;

  @Column({ type: 'int', nullable: true })
  requiredValue: number;

  @Column({ type: 'int', default: 0 })
  currentProgress: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.achievements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
