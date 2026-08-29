import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Achievement } from './Achievement';
import { Action } from './Action';
import { Log } from './Log';
import { PartnerLink } from './PartnerLink';
import { Permission } from './Permission';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  clerkId: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'int', default: 0 })
  totalPoints: number;

  @Column({ type: 'int', default: 1 })
  currentLevel: number;

  @Column({ type: 'int', default: 0 })
  pointsInCurrentLevel: number;

  @Column({ unique: true, nullable: true })
  partnerCode: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  pushToken: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  locale: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => PartnerLink, (partnerLink) => partnerLink.user1)
  partnerLinkAsUser1: PartnerLink;

  @OneToOne(() => PartnerLink, (partnerLink) => partnerLink.user2)
  partnerLinkAsUser2: PartnerLink;

  @OneToMany(() => Action, (action) => action.user)
  actions: Action[];

  @OneToMany(() => Permission, (permission) => permission.requester)
  permissionsRequested: Permission[];

  @OneToMany(() => Permission, (permission) => permission.approver)
  permissionsApproved: Permission[];

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];

  @OneToMany(() => Achievement, (achievement) => achievement.user)
  achievements: Achievement[];
}
