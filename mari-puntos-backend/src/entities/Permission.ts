import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PermissionTemplate } from './PermissionTemplate';
import { User } from './User';

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
  templateId: string;

  @Column({ type: 'uuid' })
  requesterId: string;

  @Column({ type: 'uuid', nullable: true })
  approverId: string | null;

  @Column({
    type: 'enum',
    enum: PermissionStatus,
    default: PermissionStatus.PENDING,
  })
  status: PermissionStatus;

  @Column({ type: 'timestamp' })
  requestedDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 1 })
  durationHours: number;

  @Column({ type: 'int' })
  pointsCost: number;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  responseMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PermissionTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'templateId' })
  template: PermissionTemplate;

  @ManyToOne(() => User, (user) => user.permissionsRequested, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @ManyToOne(() => User, (user) => user.permissionsApproved, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'approverId' })
  approver: User;
}
