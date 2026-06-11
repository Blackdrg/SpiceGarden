"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let WalletService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WalletService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            WalletService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        walletRepo;
        walletTransactionRepo;
        configService;
        paymentService;
        notificationService;
        logger = new common_1.Logger(WalletService.name);
        constructor(walletRepo, walletTransactionRepo, configService, paymentService, notificationService) {
            this.walletRepo = walletRepo;
            this.walletTransactionRepo = walletTransactionRepo;
            this.configService = configService;
            this.paymentService = paymentService;
            this.notificationService = notificationService;
        }
        async getWallet(userId) {
            let wallet = await this.walletRepo.findOne({ where: { userId } });
            if (!wallet) {
                // Create wallet if it doesn't exist
                wallet = this.walletRepo.create({
                    userId,
                    balance: 0,
                    currency: this.configService.get('WALLET_DEFAULT_CURRENCY', 'INR'),
                });
                wallet = await this.walletRepo.save(wallet);
            }
            return wallet;
        }
        async creditWallet(userId, amount, description, referenceId) {
            if (amount <= 0) {
                throw new common_1.BadRequestException('Amount must be greater than zero');
            }
            const wallet = await this.getWallet(userId);
            // Update wallet balance
            wallet.balance += amount;
            wallet.updatedAt = new Date();
            await this.walletRepo.save(wallet);
            // Create transaction record
            const transaction = this.walletTransactionRepo.create({
                walletId: wallet.id,
                amount,
                type: 'credit',
                description,
                referenceId,
            });
            const savedTransaction = await this.walletTransactionRepo.save(transaction);
            // Send notification for significant amounts
            if (amount >= this.configService.get('WALLET_NOTIFICATION_THRESHOLD', 100)) {
                await this.notificationService.sendPush(userId, 'Wallet Credited', `₹${amount} has been added to your wallet. New balance: ₹${wallet.balance}`, { walletId: wallet.id });
            }
            return savedTransaction;
        }
        async debitWallet(userId, amount, description, referenceId) {
            if (amount <= 0) {
                throw new common_1.BadRequestException('Amount must be greater than zero');
            }
            const wallet = await this.getWallet(userId);
            if (wallet.balance < amount) {
                throw new common_1.BadRequestException('Insufficient wallet balance');
            }
            // Update wallet balance
            wallet.balance -= amount;
            wallet.updatedAt = new Date();
            await this.walletRepo.save(wallet);
            // Create transaction record
            const transaction = this.walletTransactionRepo.create({
                walletId: wallet.id,
                amount,
                type: 'debit',
                description,
                referenceId,
            });
            const savedTransaction = await this.walletTransactionRepo.save(transaction);
            // Send notification for low balance
            if (wallet.balance < this.configService.get('WALLET_LOW_BALANCE_THRESHOLD', 50)) {
                await this.notificationService.sendPush(userId, 'Low Wallet Balance', `Your wallet balance is low: ₹${wallet.balance}. Please add funds to continue using wallet payments.`, { walletId: wallet.id });
            }
            return savedTransaction;
        }
        async compensateUser(userId, amount, reason) {
            // This is used for refund rollback or goodwill gestures
            return this.creditWallet(userId, amount, `Compensation: ${reason}`, `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        }
        async processCODPayment(orderId, amount, userId) {
            // Convert amount to number if it's a string
            const codAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            if (isNaN(codAmount) || codAmount <= 0) {
                throw new common_1.BadRequestException('Invalid COD amount');
            }
            try {
                // In a real implementation, this would integrate with delivery partner app
                // to confirm COD collection. For now, we'll simulate success.
                // For COD, we don't debit the wallet immediately - we wait for confirmation
                // from delivery that payment was collected
                // Create a pending COD transaction record
                const wallet = await this.getWallet(userId);
                const transaction = this.walletTransactionRepo.create({
                    walletId: wallet.id,
                    amount: codAmount,
                    type: 'credit', // Will be credited upon successful COD collection
                    description: `COD Payment Pending for Order #${orderId}`,
                    referenceId: orderId,
                });
                await this.walletTransactionRepo.save(transaction);
                // In production, this would trigger a notification to delivery partner
                // to collect COD from customer
                return true;
            }
            catch (error) {
                this.logger.error(`COD processing failed for order ${orderId}:`, error);
                return false;
            }
        }
        async confirmCODCollection(orderId, amount, userId) {
            // Confirm that COD was successfully collected from customer
            const codAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            if (isNaN(codAmount) || codAmount <= 0) {
                throw new common_1.BadRequestException('Invalid COD amount');
            }
            const wallet = await this.getWallet(userId);
            // Find the pending COD transaction
            const pendingTransaction = await this.walletTransactionRepo.findOne({
                where: {
                    walletId: wallet.id,
                    referenceId: orderId,
                    description: (0, typeorm_1.Like)(`%COD Payment Pending%`),
                },
                order: { createdAt: 'DESC' },
            });
            if (!pendingTransaction) {
                throw new common_1.NotFoundException('No pending COD transaction found for this order');
            }
            // Update the transaction to reflect actual collection
            pendingTransaction.amount = codAmount;
            pendingTransaction.description = `COD Payment Collected for Order #${orderId}`;
            // Note: We don't change type from credit to debit here because
            // the wallet already received the funds when COD was confirmed
            const updatedTransaction = await this.walletTransactionRepo.save(pendingTransaction);
            // Update wallet balance (add the COD amount)
            wallet.balance += codAmount;
            wallet.updatedAt = new Date();
            await this.walletRepo.save(wallet);
            // Send notification
            await this.notificationService.sendPush(userId, 'COD Payment Confirmed', `Your COD payment of ₹${codAmount} for order #${orderId} has been confirmed. Wallet balance: ₹${wallet.balance}`, { walletId: wallet.id });
            return updatedTransaction;
        }
        async refundCOD(orderId, amount, userId, reason) {
            // Refund a COD transaction (when order is cancelled after COD confirmation)
            const codAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            if (isNaN(codAmount) || codAmount <= 0) {
                throw new common_1.BadRequestException('Invalid COD amount');
            }
            const wallet = await this.getWallet(userId);
            // Find the confirmed COD transaction
            const codTransaction = await this.walletTransactionRepo.findOne({
                where: {
                    walletId: wallet.id,
                    referenceId: orderId,
                    description: (0, typeorm_1.Like)(`%COD Payment Collected%`),
                },
                order: { createdAt: 'DESC' },
            });
            if (!codTransaction) {
                throw new common_1.NotFoundException('No confirmed COD transaction found for this order');
            }
            // Debit the wallet for the refund
            return this.debitWallet(userId, codAmount, `COD Refund: ${reason}`, `COD-REF-${orderId}-${Date.now()}`);
        }
        async getWalletTransactions(userId, limit = 20, offset = 0) {
            const wallet = await this.getWallet(userId);
            return await this.walletTransactionRepo.find({
                where: { walletId: wallet.id },
                order: { createdAt: 'DESC' },
                take: limit,
                skip: offset,
            });
        }
        async getWalletBalance(userId) {
            const wallet = await this.getWallet(userId);
            return {
                balance: wallet.balance,
                currency: wallet.currency,
            };
        }
        async preventDoublePayment(userId, orderId, amount) {
            // Check for recent payments for the same order/user combination
            const recentTransactions = await this.walletTransactionRepo.find({
                where: {
                    walletId: (await this.getWallet(userId)).id,
                    referenceId: orderId,
                    createdAt: new Date(Date.now() - 300000), // Last 5 minutes
                },
            });
            // If we already have a successful transaction for this order recently, flag as potential duplicate
            if (recentTransactions.length > 0) {
                const successfulTransactions = recentTransactions.filter(t => t.description.toLowerCase().includes('confirmed') ||
                    t.description.toLowerCase().includes('completed'));
                if (successfulTransactions.length > 0) {
                    this.logger.warn(`Potential duplicate payment detected for user ${userId}, order ${orderId}`);
                    return false; // Indicates potential duplicate
                }
            }
            return true; // No duplicate detected
        }
        async reconcilePayments() {
            // This would be run as a periodic job to reconcile payment records
            // between our database, payment gateway, and wallet transactions
            // For now, returning a placeholder implementation
            // In production, this would:
            // 1. Fetch all payment records from Stripe/Payment gateway for a period
            // 2. Compare with our order payment statuses
            // 3. Compare with wallet transactions
            // 4. Identify and flag discrepancies
            // 5. Auto-correct where possible or alert for manual intervention
            return {
                totalProcessed: 0,
                successful: 0,
                failed: 0,
                discrepancies: [],
            };
        }
    };
    return WalletService = _classThis;
})();
exports.WalletService = WalletService;
