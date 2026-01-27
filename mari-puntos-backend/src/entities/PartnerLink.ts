import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum PartnerLinkStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('partner_links')
export class PartnerLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  linkCode: string;

  @Column({
    type: 'enum',
    enum: PartnerLinkStatus,
    default: PartnerLinkStatus.PENDING,
  })
  status: PartnerLinkStatus;

  @Column({ type: 'uuid', nullable: true })
  user1Id: string;

  @Column({ type: 'uuid', nullable: true })
  user2Id: string;

  @Column({ type: 'timestamp', nullable: true })
  linkedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.partnerLinkAsUser1)
  @JoinColumn({ name: 'user1Id' })
  user1: User;

  @OneToOne(() => User, (user) => user.partnerLinkAsUser2)
  @JoinColumn({ name: 'user2Id' })
  user2: User;
}
