# Database Bootstrap Report

## DataSource Configuration

### PostgreSQL Connection
- **Host**: localhost (default) or DB_HOST env var
- **Port**: 5432 (default) or DB_PORT env var
- **Database**: spicegarden (default) or DB_NAME env var
- **Username**: spicegarden (default) or DB_USER env var
- **Synchronize**: true (auto-sync entities)

### MongoDB Connection
- **URI**: mongodb://localhost:27017/spicegarden (default) or MONGO_URI env var
- **Model**: ReviewDocument

## Registered Entities (54 entities)

| Entity | Provider Token |
|--------|---------------|
| UserEntity | getRepositoryToken(UserEntity) |
| OrderEntity | getRepositoryToken(OrderEntity) |
| SessionEntity | getRepositoryToken(SessionEntity) |
| AuditLogEntity | getRepositoryToken(AuditLogEntity) |
| RestaurantEntity | getRepositoryToken(RestaurantEntity) |
| RestaurantBranchEntity | getRepositoryToken(RestaurantBranchEntity) |
| MenuCategoryEntity | getRepositoryToken(MenuCategoryEntity) |
| MenuItemEntity | getRepositoryToken(MenuItemEntity) |
| InventoryItemEntity | getRepositoryToken(InventoryItemEntity) |
| DriverEntity | getRepositoryToken(DriverEntity) |
| WalletEntity | getRepositoryToken(WalletEntity) |
| WalletTransactionEntity | getRepositoryToken(WalletTransactionEntity) |
| AddressEntity | getRepositoryToken(AddressEntity) |
| MenuVariantEntity | getRepositoryToken(MenuVariantEntity) |
| MenuAddonEntity | getRepositoryToken(MenuAddonEntity) |
| OrderItemEntity | getRepositoryToken(OrderItemEntity) |
| SubscriptionEntity | getRepositoryToken(SubscriptionEntity) |
| OtpEntity | getRepositoryToken(OtpEntity) |
| DeviceFingerprintEntity | getRepositoryToken(DeviceFingerprintEntity) |
| RecipeEntity | getRepositoryToken(RecipeEntity) |
| BatchEntity | getRepositoryToken(BatchEntity) |
| FoodPrepEntity | getRepositoryToken(FoodPrepEntity) |
| KitchenSLAEntity | getRepositoryToken(KitchenSLAEntity) |
| SupplierEntity | getRepositoryToken(SupplierEntity) |
| InventoryAlertEntity | getRepositoryToken(InventoryAlertEntity) |
| DriverAssignmentEntity | getRepositoryToken(DriverAssignmentEntity) |
| SLAAlertEntity | getRepositoryToken(SLAAlertEntity) |
| MenuItemAvailabilityEntity | getRepositoryToken(MenuItemAvailabilityEntity) |
| DriverScoreEntity | getRepositoryToken(DriverScoreEntity) |
| DeliverySLAEntity | getRepositoryToken(DeliverySLAEntity) |
| DriverFraudEntity | getRepositoryToken(DriverFraudEntity) |
| StripeWebhookEntity | getRepositoryToken(StripeWebhookEntity) |
| GSTDetailEntity | getRepositoryToken(GSTDetailEntity) |
| PaymentDisputeEntity | getRepositoryToken(PaymentDisputeEntity) |
| IdempotencyEntity | getRepositoryToken(IdempotencyEntity) |
| PaymentValidationEventEntity | getRepositoryToken(PaymentValidationEventEntity) |
| PaymentFraudFlagEntity | getRepositoryToken(PaymentFraudFlagEntity) |
| PaymentEventEntity | getRepositoryToken(PaymentEventEntity) |
| RefundEntity | getRepositoryToken(RefundEntity) |
| RefundApprovalEntity | getRepositoryToken(RefundApprovalEntity) |
| CommissionRuleEntity | getRepositoryToken(CommissionRuleEntity) |
| MenuModerationEntity | getRepositoryToken(MenuModerationEntity) |
| RestaurantOnboardingEntity | getRepositoryToken(RestaurantOnboardingEntity) |
| DisputeEntity | getRepositoryToken(DisputeEntity) |
| SupportTicketEntity | getRepositoryToken(SupportTicketEntity) |
| PaymentMethodEntity | getRepositoryToken(PaymentMethodEntity) |

## Registered Repositories

All repositories are registered via LocalRepositoryModule (local mode) or TypeOrmModule.forFeature() (production mode).

### Special Repository Registrations
- **QueueModule**: OrderEntity repository (for OrderProcessor)
- **ReviewServiceModule**: ReviewDocument model (for ReviewService)

## Active DataSource Instances

### Local Mode
- Mock DataSource provided via 'DataSource' token
- Also aliased via DataSource class for @InjectDataSource()

### Production Mode
- Real PostgreSQL DataSource from TypeOrmModule.forRootAsync
- Real MongoDB connection from MongooseModule.forRootAsync