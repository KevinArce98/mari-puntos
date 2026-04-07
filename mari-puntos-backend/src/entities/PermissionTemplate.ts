import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PartnerLink } from './PartnerLink';
import { Permission } from './Permission';

export enum PermissionCategory {
  GAMING = 'gaming',
  SOCIAL = 'social',
  SPORTS = 'sports',
  HOBBIES = 'hobbies',
  ENTERTAINMENT = 'entertainment',
  PERSONAL_TIME = 'personal_time',
  OTHER = 'other',
}

@Entity('permission_templates')
export class PermissionTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: PermissionCategory,
    default: PermissionCategory.OTHER,
  })
  category: PermissionCategory;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  suggestedDurationHours: number | null;

  @Column({ type: 'int', nullable: true })
  suggestedPointsCost: number | null;

  @Column({ type: 'boolean', default: false })
  isSystemTemplate: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  partnerLinkId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => PartnerLink, { nullable: true })
  @JoinColumn({ name: 'partnerLinkId' })
  partnerLink: PartnerLink | null;

  @OneToMany(() => Permission, (permission) => permission.template)
  permissions: Permission[];
}
