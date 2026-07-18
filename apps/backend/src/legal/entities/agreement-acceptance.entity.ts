import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('agreement_acceptances')
@Index('idx_agreement_acceptances_party', ['partyId'])
@Index('idx_agreement_acceptances_user', ['userId'])
@Index('idx_agreement_acceptances_agreement', ['agreementId'])
export class AgreementAcceptanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  agreementId!: string;

  @Column({ type: 'uuid', nullable: true })
  userId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  partyId!: string;

  @Column({ type: 'varchar', length: 20 })
  partyType!: string;

  @Column({ type: 'int' })
  version!: number;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  signature!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  digitalSignature!: string;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
