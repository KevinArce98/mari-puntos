import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum PermissionType {
  NIGHT_OUT = 'night_out',
  GAMING_SESSION = 'gaming_session',
  SPORTS_EVENT = 'sports_event',
  FRIENDS_HANGOUT = 'friends_hangout',
  HOBBY_TIME = 'hobby_time',
  OTHER = 'other',
}

export enum PermissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  requesterId: string;

  @Column({ type: 'uuid', nullable: true })
  approverId: string | null;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: PermissionType,
    default: PermissionType.OTHER,
  })
  type: PermissionType;

  @Column({
    type: 'enum',
    enum: PermissionStatus,
    default: PermissionStatus.PENDING,
  })
  status: PermissionStatus;

  @Column({ type: 'timestamp' })
  requestedDate: Date;

  @Column({ type: 'int' })
  durationHours: number;

  @Column({ type: 'int', default: 0 })
  pointsCost: number;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  responseMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.permissionsRequested)
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @ManyToOne(() => User, (user) => user.permissionsApproved)
  @JoinColumn({ name: 'approverId' })
  approver: User;
}
