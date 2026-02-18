import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum LogType {
  POINTS_EARNED = 'points_earned',
  POINTS_SPENT = 'points_spent',
  LEVEL_UP = 'level_up',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  PERMISSION_REQUESTED = 'permission_requested',
  PERMISSION_APPROVED = 'permission_approved',
  PERMISSION_REJECTED = 'permission_rejected',
  ACTION_CREATED = 'action_created',
  ACTION_APPROVED = 'action_approved',
  ACTION_REJECTED = 'action_rejected',
  REWARD_REDEEMED = 'reward_redeemed',
  PARTNER_LINKED = 'partner_linked',
  PARTNER_UNLINKED = 'partner_unlinked',
  OTHER = 'other',
}

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: LogType,
  })
  type: LogType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'int', default: 0 })
  pointsChange: number;

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId: string;

  @Column({ nullable: true })
  relatedEntityType: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.logs)
  @JoinColumn({ name: 'userId' })
  user: User;
}
