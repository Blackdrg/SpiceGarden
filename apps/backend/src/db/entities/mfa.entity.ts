import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('mfa_secrets')
export class MfaSecretEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => UserEntity)
    @JoinColumn()
    user!: UserEntity;

    @Column()
    secret!: string; // This should be encrypted
}