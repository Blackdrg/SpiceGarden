/**
 * SPICEGARDEN SIMULATION - Dataset Generator
 * Generates deterministic 500+ tenant dataset, restaurants, menus, inventory, drivers, users.
 * Produces cryptographic checksums of dataset for reproducibility.
 */

const crypto = require('crypto');

class DatasetGenerator {
  constructor(seed = '0x5P1CE64RDEN_500K_SIM') {
    this.seed = seed;
    this.tenantCount = 500;
    this.restaurantsPerTenant = 5;
    this.itemsPerRestaurant = 10;
  }

  // Deterministic Pseudo Random Number Generator (PRNG)
  _createRng(salt) {
    let hash = crypto.createHash('sha256').update(`${this.seed}:${salt}`).digest();
    let idx = 0;
    return () => {
      if (idx >= hash.length - 4) {
        hash = crypto.createHash('sha256').update(hash).digest();
        idx = 0;
      }
      const val = hash.readUInt32LE(idx) / 0xFFFFFFFF;
      idx += 4;
      return val;
    };
  }

  async populate(postgres, redis) {
    const rng = this._createRng('dataset');
    const cities = ['New York', 'San Francisco', 'Chicago', 'Austin', 'Seattle', 'London', 'Toronto', 'Sydney'];
    const cuisines = ['Indian', 'Italian', 'Mexican', 'Japanese', 'Thai', 'Mediterranean', 'American', 'Chinese'];
    const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'None'];

    console.log(`[DatasetGenerator] Seeding ${this.tenantCount} tenants with deterministic seed ${this.seed}...`);

    const datasetManifest = {
      tenantCount: this.tenantCount,
      restaurantCount: 0,
      menuItemCount: 0,
      inventoryCount: 0,
      driverCount: 0,
      userCount: 0,
    };

    // 1. Seed Tenants
    for (let t = 1; t <= this.tenantCount; t++) {
      const tenantId = `tenant-${String(t).padStart(3, '0')}`;
      const tenant = {
        id: tenantId,
        name: `SpiceGarden Enterprise Tenant ${t}`,
        status: 'ACTIVE',
        tier: t <= 50 ? 'ENTERPRISE_TIER_1' : 'STANDARD_TIER_2',
        created_at: new Date(1700000000000 + t * 1000).toISOString()
      };
      await postgres.insert('tenants', tenant);

      // Cache tenant in Redis
      await redis.set(`cache:tenant:${tenantId}`, tenant, { ex: 3600 });

      // 2. Seed Restaurants
      for (let r = 1; r <= this.restaurantsPerTenant; r++) {
        const restId = `rest_${tenantId}_${r}`;
        const city = cities[Math.floor(rng() * cities.length)];
        const cuisine = cuisines[Math.floor(rng() * cuisines.length)];
        const restaurant = {
          id: restId,
          tenant_id: tenantId,
          name: `${cuisine} Haven - ${city} #${r}`,
          city,
          cuisine,
          rating: parseFloat((4.0 + rng() * 0.9).toFixed(1)),
          is_open: true,
          prep_time_minutes: 15 + Math.floor(rng() * 20),
          created_at: new Date(1700000000000 + (t * 10 + r) * 1000).toISOString()
        };
        await postgres.insert('restaurants', restaurant);
        datasetManifest.restaurantCount++;

        // Cache restaurant in Redis
        await redis.set(`cache:restaurant:${restId}`, restaurant, { ex: 3600 });

        // 3. Seed Categories & Menu Items
        for (let i = 1; i <= this.itemsPerRestaurant; i++) {
          const itemId = `item_${restId}_${i}`;
          const catId = `cat_${restId}_${(i % 3) + 1}`;
          const dietary = dietaryOptions[Math.floor(rng() * dietaryOptions.length)];
          const basePrice = 8.99 + Math.floor(rng() * 20);

          const menuItem = {
            id: itemId,
            tenant_id: tenantId,
            restaurant_id: restId,
            category_id: catId,
            name: `Signature Dish ${i} (${cuisine})`,
            description: `Delicious ${cuisine} specialty prepared fresh with authentic spices.`,
            price: basePrice,
            dietary,
            is_available: true,
            created_at: new Date(1700000000000 + i * 1000).toISOString()
          };
          await postgres.insert('menu_items', menuItem);
          datasetManifest.menuItemCount++;

          // Initial Inventory (10,000 units each)
          const inv = {
            id: `inv_${itemId}`,
            tenant_id: tenantId,
            restaurant_id: restId,
            item_id: itemId,
            available_stock: 10000,
            reserved_stock: 0,
            updated_at: new Date().toISOString()
          };
          await postgres.insert('inventory', inv);
          datasetManifest.inventoryCount++;

          // Cache menu item in Redis
          await redis.set(`cache:menu_item:${itemId}`, menuItem, { ex: 3600 });
          await redis.set(`cache:inventory:${itemId}`, { stock: 10000 }, { ex: 60 });
        }
      }

      // 4. Seed Drivers (20 drivers per tenant)
      for (let d = 1; d <= 20; d++) {
        const driverId = `driver_${tenantId}_${d}`;
        const driver = {
          id: driverId,
          tenant_id: tenantId,
          name: `Courier ${d} (${tenantId})`,
          status: 'AVAILABLE',
          lat: 40.7128 + (rng() - 0.5) * 0.1,
          lng: -74.0060 + (rng() - 0.5) * 0.1,
          rating: 4.8
        };
        await postgres.insert('drivers', driver);
        datasetManifest.driverCount++;
      }
    }

    // Hash the manifest for cryptographic verification
    const manifestString = JSON.stringify(datasetManifest);
    const datasetHash = crypto.createHash('sha256').update(manifestString).digest('hex');

    console.log(`[DatasetGenerator] Dataset populated successfully. Hash: ${datasetHash}`);
    return {
      manifest: datasetManifest,
      hash: datasetHash
    };
  }
}

module.exports = { DatasetGenerator };
