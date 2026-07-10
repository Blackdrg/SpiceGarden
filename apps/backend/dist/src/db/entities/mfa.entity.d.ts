import { UserEntity } from './user.entity';
export declare class MfaSecretEntity {
    id: string;
    user: UserEntity;
    secret: string;
}
