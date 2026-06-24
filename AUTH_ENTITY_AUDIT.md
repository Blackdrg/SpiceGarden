# AUTH ENTITY AUDIT

## Entity: UserEntity (`apps/backend/src/db/entities/user.entity.ts`)

### Fields

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | UUID | Primary Key, Auto-generated | `PrimaryGeneratedColumn('uuid')` |
| `fullName` | string | Required | No length constraint |
| `email` | string | Required, UNIQUE | `Column()` with `@Column({ unique: true })` |
| `phone` | string | Required, UNIQUE | `@Column({ unique: true })` |
| `passwordHash` | string | Required | Plain `@Column()` |
| `profileImage` | string | Nullable | `@Column({ nullable: true })` |
| `role` | enum | Required, default=CUSTOMER | `@Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })` |
| `status` | enum | Required, default=ACTIVE | `@Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })` |
| `emailVerified` | boolean | Required, default=false | `@Column({ default: false })` |
| `phoneVerified` | boolean | Required, default=false | `@Column({ default: false })` |
| `createdAt` | Date | Auto | `CreateDateColumn()` |
| `updatedAt` | Date | Auto | `UpdateDateColumn()` |
| `deletedAt` | Date | Nullable (soft delete) | `DeleteDateColumn()` |

### Indexes

- Primary key: `id` (UUID, auto-generated)
- Unique index: `email` (line 12-13)
- Unique index: `phone` (line 15-16)
- No additional explicit `@Index()` decorators beyond primary key

### Validations

- No `@Length()`, `@IsEmail()`, `@IsNotEmpty()`, or class-validator decorators
- No `@BeforeInsert()` or `@BeforeUpdate()` hooks
- No default value normalization (email case, whitespace trimming)
- Enum values validated at database level only

### Security Concerns

1. **No email normalization**: `"User@Example.com"` and `"user@example.com"` are treated as different emails
2. **No password complexity validation at entity level**: Relies on DTO/service validation
3. **No rate limiting at entity level**: Relies on `ThrottlerGuard` on controller
4. **Soft delete via `deletedAt`**: `findOne` does not filter out soft-deleted records — could return deleted users during login
5. **Phone uniqueness**: Could block legitimate re-registration if phone is reused

### TypeORM Behavior Notes

- `@DeleteDateColumn()` means TypeORM sets `deletedAt` on soft delete, but queries do NOT automatically exclude soft-deleted rows unless `@DeleteDateColumn()` is paired with a `@Column({ nullable: true })` and the repository uses `.find()` with `withDeleted: false` (default)
- `unique: true` on `email` and `phone` creates unique indexes at the database level
- With `LocalRepositoryModule` (in-memory mock), uniqueness is NOT enforced — the mock `findOne` was broken (returning first row regardless of criteria)

### Critical Finding

**The in-memory `LocalRepositoryModule` mock had a broken `findOne` implementation** that returned `rows[0]` regardless of the `where` clause. This caused the registration flow to always find a previously registered user after the first registration, making every subsequent register attempt return "Email already registered."
