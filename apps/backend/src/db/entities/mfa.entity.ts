import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('mfa_secrets')
export class MfaSecretEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => UserEntity, { nullable: true })
    @JoinColumn()
    user?: UserEntity;

    @Column({ nullable: false })
    secret!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}