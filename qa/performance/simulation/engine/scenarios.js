/**
 * SPICEGARDEN SIMULATION - Six Core User Scenarios
 * Implements exact VU distributions, realistic multi-step user flows, and stateful mutations.
 */

const crypto = require('crypto');

class ScenarioEngine {
  constructor({ postgres, redis, queue, paymentGateway, websocket, albRouter }) {
    this.postgres = postgres;
    this.redis = redis;
    this.queue = queue;
    this.paymentGateway = paymentGateway;
    this.websocket = websocket;
    this.albRouter = albRouter;

    this.scenarioWeights = {
      browse: 0.45,
      search: 0.20,
      cart: 0.10,
      checkout: 0.08,
      tracking: 0.14,
      admin: 0.03
    };

    this.metrics = {
      browse: { executions: 0, errors: 0, latencies: [] },
      search: { executions: 0, errors: 0, latencies: [] },
      cart: { executions: 0, errors: 0, latencies: [] },
      checkout: { executions: 0, errors: 0, latencies: [] },
      tracking: { executions: 0, errors: 0, latencies: [] },
      admin: { executions: 0, errors: 0, latencies: [] },
      crossTenantAttempts: 0,
      crossTenantViolations: 0
    };
  }

  // 1. BROWSE SIMULATION (45% Weight)
  async executeBrowse(userContext) {
    const startMs = performance.now();
    this.metrics.browse.executions++;

    try {
      await this.albRouter.route(async () => {
        const { tenantId } = userContext;
        
        // Step 1: GET Restaurants (Cache-first)
        let restaurants = await this.redis.get(`cache:restaurants:${tenantId}`);
        if (!restaurants) {
          restaurants = await this.postgres.query('restaurants', { tenant_id: tenantId }, 20);
          await this.redis.set(`cache:restaurants:${tenantId}`, restaurants, { ex: 300 });
        }

        if (!restaurants || restaurants.length === 0) return;

        // Step 2: Select Restaurant & GET Details
        const selectedRest = restaurants[Math.floor(Math.random() * restaurants.length)];
        let restDetails = await this.redis.get(`cache:restaurant:${selectedRest.id}`);
        if (!restDetails) {
          restDetails = await this.postgres.findById('restaurants', selectedRest.id, tenantId);
          if (restDetails) {
            await this.redis.set(`cache:restaurant:${selectedRest.id}`, restDetails, { ex: 3600 });
          }
        }

        // Step 3: GET Menu & Categories
        const subAction = Math.random();
        if (subAction > 0.3) {
          let menuItems = await this.redis.get(`cache:menu:${selectedRest.id}`);
          if (!menuItems) {
            menuItems = await this.postgres.query('menu_items', { restaurant_id: selectedRest.id, tenant_id: tenantId }, 50);
            await this.redis.set(`cache:menu:${selectedRest.id}`, menuItems, { ex: 600 });
          }

          // Step 4: GET Customization options (10% subset)
          if (subAction > 0.9 && menuItems && menuItems.length > 0) {
            const item = menuItems[0];
            await this.redis.get(`cache:customization:${item.id}`);
          }
        }
      });
      const duration = performance.now() - startMs;
      this.metrics.browse.latencies.push(duration);
    } catch (err) {
      this.metrics.browse.errors++;
      throw err;
    }
  }

  // 2. SEARCH SIMULATION (20% Weight)
  async executeSearch(userContext) {
    const startMs = performance.now();
    this.metrics.search.executions++;

    try {
      await this.albRouter.route(async () => {
        const { tenantId } = userContext;
        const subAction = Math.random();

        // 60% Restaurant Search, 25% Nearby, 15% Category/Cuisine
        if (subAction < 0.60) {
          // Hot query vs tail query
          const isHot = Math.random() < 0.40;
          const queryTerm = isHot ? 'Indian' : `Dish_${Math.floor(Math.random() * 50)}`;
          const cacheKey = `search:${tenantId}:${queryTerm}`;

          let results = await this.redis.get(cacheKey);
          if (!results) {
            results = await this.postgres.query('restaurants', { tenant_id: tenantId, cuisine: 'Indian' }, 10);
            await this.redis.set(cacheKey, results, { ex: 120 });
          }
        } else if (subAction < 0.85) {
          // Nearby Geo search
          const city = ['New York', 'San Francisco', 'Austin'][Math.floor(Math.random() * 3)];
          await this.postgres.query('restaurants', { tenant_id: tenantId, city }, 10);
        } else {
          // Cuisine / Dietary search
          await this.postgres.query('menu_items', { tenant_id: tenantId, dietary: 'Vegetarian' }, 15);
        }
      });
      const duration = performance.now() - startMs;
      this.metrics.search.latencies.push(duration);
    } catch (err) {
      this.metrics.search.errors++;
      throw err;
    }
  }

  // 3. CART SIMULATION (10% Weight)
  async executeCart(userContext) {
    const startMs = performance.now();
    this.metrics.cart.executions++;

    try {
      await this.albRouter.route(async () => {
        const { tenantId, customerId } = userContext;
        const cartKey = `cart:${tenantId}:${customerId}`;

        // Subaction: 50% add, 20% update, 10% remove, 20% calculation
        const subAction = Math.random();
        let cart = (await this.redis.get(cartKey)) || {
          items: [],
          subtotal: 0,
          couponCode: null,
          deliveryFee: 2.99,
          total: 2.99
        };

        if (subAction < 0.50) {
          // Add item
          const restId = `rest_${tenantId}_1`;
          const newItem = {
            itemId: `item_${restId}_1`,
            name: 'Signature Dish 1',
            price: 14.99,
            quantity: 1,
            addons: ['Extra Spice', 'Garlic Naan']
          };
          cart.items.push(newItem);
        } else if (subAction < 0.70 && cart.items.length > 0) {
          // Update quantity
          cart.items[0].quantity += 1;
        } else if (subAction < 0.80 && cart.items.length > 0) {
          // Remove item
          cart.items.pop();
        }

        // Calculate Totals & Apply coupon
        let subtotal = 0;
        for (const itm of cart.items) {
          subtotal += itm.price * itm.quantity;
        }
        cart.subtotal = parseFloat(subtotal.toFixed(2));
        cart.total = parseFloat((cart.subtotal + (cart.items.length > 0 ? cart.deliveryFee : 0)).toFixed(2));

        // Save Cart to Redis
        await this.redis.set(cartKey, cart, { ex: 3600 });
      });
      const duration = performance.now() - startMs;
      this.metrics.cart.latencies.push(duration);
    } catch (err) {
      this.metrics.cart.errors++;
      throw err;
    }
  }

  // 4. CHECKOUT / ORDER SIMULATION (8% Weight)
  async executeCheckout(userContext) {
    const startMs = performance.now();
    this.metrics.checkout.executions++;

    try {
      await this.albRouter.route(async () => {
        const { tenantId, customerId } = userContext;
        const idempotencyKey = `idemp_${customerId}_${Date.now()}`;
        const orderId = `ord_${crypto.randomBytes(8).toString('hex')}`;
        const restId = `rest_${tenantId}_1`;
        const itemId = `item_${restId}_1`;

        // Distributed lock on inventory
        const lockId = await this.redis.acquireLock(`inventory:${itemId}`, 3000);

        try {
          // Step 1: Transaction - Deduct Inventory & Create Order
          const order = await this.postgres.transaction(async (tx) => {
            // Find inventory
            const invList = await tx.query('inventory', { tenant_id: tenantId, item_id: itemId });
            if (invList.length > 0) {
              const inv = invList[0];
              if (inv.available_stock > 0) {
                await tx.update('inventory', inv.id, { available_stock: inv.available_stock - 1 }, inv.version);
              }
            }

            // Create Order
            return await tx.insert('orders', {
              id: orderId,
              tenant_id: tenantId,
              customer_id: customerId,
              restaurant_id: restId,
              status: 'PENDING_PAYMENT',
              total_amount: 29.98,
              items: [{ item_id: itemId, quantity: 1, price: 29.98 }]
            });
          });

          // Step 2: Payment Intent & Capture
          const paymentIntent = await this.paymentGateway.createPaymentIntent({
            orderId,
            amount: order.total_amount,
            customerId,
            tenantId,
            idempotencyKey
          });

          const captureResult = await this.paymentGateway.capturePayment(paymentIntent.id, 'card');

          if (captureResult.success) {
            // Step 3: Transition Order to CONFIRMED
            await this.postgres.update('orders', orderId, { status: 'CONFIRMED' });

            // Step 4: Enqueue Events to BullMQ
            await this.queue.add('order-events', { orderId, tenantId, event: 'ORDER_PLACED' }, { jobId: `evt_ord_${orderId}` });
            await this.queue.add('payment-events', { paymentId: paymentIntent.id, orderId, status: 'PAID' }, { jobId: `evt_pay_${orderId}` });

            // Step 5: Kitchen Ticket Creation
            await this.postgres.insert('kitchen_tickets', {
              id: `kt_${orderId}`,
              tenant_id: tenantId,
              restaurant_id: restId,
              order_id: orderId,
              status: 'ACCEPTED'
            });

            // Step 6: Driver Assignment
            const driverId = `driver_${tenantId}_1`;
            await this.postgres.update('orders', orderId, { status: 'DISPATCHED', driver_id: driverId });
          } else {
            // Payment failed - Compensating transition
            await this.postgres.update('orders', orderId, { status: 'PAYMENT_FAILED' });
          }
        } finally {
          if (lockId) {
            await this.redis.releaseLock(`inventory:${itemId}`, lockId);
          }
        }
      });
      const duration = performance.now() - startMs;
      this.metrics.checkout.latencies.push(duration);
    } catch (err) {
      this.metrics.checkout.errors++;
      throw err;
    }
  }

  // 5. TRACKING / WEBSOCKET SIMULATION (14% Weight)
  async executeTracking(userContext) {
    const startMs = performance.now();
    this.metrics.tracking.executions++;

    try {
      const { tenantId, customerId } = userContext;
      const orderId = `ord_track_${customerId}`;
      const driverId = `driver_${tenantId}_1`;

      // Session Connect & Subscribe
      const session = this.websocket.createSession({
        userId: customerId,
        orderId,
        driverId,
        tenantId
      });

      // Heartbeat
      this.websocket.sendHeartbeat(session.connectionId);

      // Driver GPS Location broadcast
      this.websocket.broadcastLocationUpdate(driverId, orderId, {
        lat: 40.7128 + Math.random() * 0.01,
        lng: -74.0060 + Math.random() * 0.01,
        speed: 25.5,
        bearing: 180
      });

      // Order Status Broadcast
      this.websocket.broadcastOrderStatus(orderId, 'OUT_FOR_DELIVERY', { etaMinutes: 12 });

      // Simulate connection lifecycle retention & graceful disconnect
      if (Math.random() < 0.05) {
        this.websocket.disconnect(session.connectionId);
      }

      const duration = performance.now() - startMs;
      this.metrics.tracking.latencies.push(duration);
    } catch (err) {
      this.metrics.tracking.errors++;
      throw err;
    }
  }

  // 6. ADMIN / KITCHEN SIMULATION (3% Weight)
  async executeAdmin(userContext) {
    const startMs = performance.now();
    this.metrics.admin.executions++;

    try {
      await this.albRouter.route(async () => {
        const { tenantId } = userContext;

        // Admin Dashboard Stats
        await this.postgres.query('orders', { tenant_id: tenantId, status: 'CONFIRMED' }, 20);
        await this.postgres.query('kitchen_tickets', { tenant_id: tenantId }, 20);

        // Low stock inventory inspection
        await this.postgres.query('inventory', { tenant_id: tenantId }, 10);

        // Cross-Tenant Security Probe (Explicit Verification)
        this.metrics.crossTenantAttempts++;
        const otherTenantId = tenantId === 'tenant-001' ? 'tenant-002' : 'tenant-001';
        const leakCheck = await this.postgres.findById('tenants', otherTenantId, tenantId);
        if (leakCheck && leakCheck.id === otherTenantId) {
          this.metrics.crossTenantViolations++;
        }
      });
      const duration = performance.now() - startMs;
      this.metrics.admin.latencies.push(duration);
    } catch (err) {
      this.metrics.admin.errors++;
      throw err;
    }
  }

  getMetrics() {
    const calculatePercentiles = (arr) => {
      if (!arr || arr.length === 0) return { p50: 0, p95: 0, p99: 0 };
      const sorted = [...arr].sort((a, b) => a - b);
      const count = sorted.length;
      return {
        p50: sorted[Math.floor(count * 0.50)],
        p95: sorted[Math.floor(count * 0.95)],
        p99: sorted[Math.floor(count * 0.99)],
      };
    };

    return {
      browse: {
        executions: this.metrics.browse.executions,
        errors: this.metrics.browse.errors,
        ...calculatePercentiles(this.metrics.browse.latencies)
      },
      search: {
        executions: this.metrics.search.executions,
        errors: this.metrics.search.errors,
        ...calculatePercentiles(this.metrics.search.latencies)
      },
      cart: {
        executions: this.metrics.cart.executions,
        errors: this.metrics.cart.errors,
        ...calculatePercentiles(this.metrics.cart.latencies)
      },
      checkout: {
        executions: this.metrics.checkout.executions,
        errors: this.metrics.checkout.errors,
        ...calculatePercentiles(this.metrics.checkout.latencies)
      },
      tracking: {
        executions: this.metrics.tracking.executions,
        errors: this.metrics.tracking.errors,
        ...calculatePercentiles(this.metrics.tracking.latencies)
      },
      admin: {
        executions: this.metrics.admin.executions,
        errors: this.metrics.admin.errors,
        ...calculatePercentiles(this.metrics.admin.latencies)
      },
      crossTenantAttempts: this.metrics.crossTenantAttempts,
      crossTenantViolations: this.metrics.crossTenantViolations
    };
  }
}

module.exports = { ScenarioEngine };
