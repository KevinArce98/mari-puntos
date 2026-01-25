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

  @Column({ unique: true })
  linkCode: string;

  @Column({
    type: 'enum',
    enum: PartnerLinkStatus,
    default: PartnerLinkStatus.PENDING,
  })
  status: PartnerLinkStatus;

  @Column({ type: 'uuid', nullable: true })
  husbandId: string;

  @Column({ type: 'uuid', nullable: true })
  wifeId: string;

  @Column({ type: 'timestamp', nullable: true })
  linkedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.partnerLinkAsHusband)
  @JoinColumn({ name: 'husbandId' })
  husband: User;

  @OneToOne(() => User, (user) => user.partnerLinkAsWife)
  @JoinColumn({ name: 'wifeId' })
  wife: User;
}
