#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spicegarden';
const TEST_DB = 'spicegarden_test';
const TIMEOUT_MS = 10000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  let client;
  let db;
  let passed = 0;
  let failed = 0;

  async function assert(description, testFn) {
    try {
      await testFn();
      console.log(`  ✓ ${description}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${description}: ${err.message}`);
      failed++;
    }
  }

  try {
    await assert('MONGO_URI is configured in env', async () => {
      if (!MONGO_URI || !MONGO_URI.startsWith('mongodb://')) {
        throw new Error(`Invalid MONGO_URI: ${MONGO_URI}`);
      }
    });

    await assert('connect to MongoDB via MongoClient', async () => {
      client = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS: TIMEOUT_MS,
      });
      await client.connect();
      db = client.db(TEST_DB);
      if (!db) throw new Error('db not initialized after connect');
    }, TIMEOUT_MS);

    await assert('server version reported', async () => {
      const status = await db.admin().serverStatus();
      if (!status.version || typeof status.version !== 'string') {
        throw new Error(`unexpected version: ${status.version}`);
      }
      console.log(`    server version: ${status.version}`);
    }, TIMEOUT_MS);

    await assert('listCollections returns array', async () => {
      const collections = await db.listCollections().toArray();
      if (!Array.isArray(collections)) {
        throw new Error('listCollections did not return array');
      }
      console.log(`    collections found: ${collections.length}`);
    }, TIMEOUT_MS);

    await assert('insert document into _connection_test', async () => {
      const result = await db.collection('_connection_test').insertOne({
        suite: 'mongo-test',
        ts: new Date().toISOString(),
      });
      if (!result.insertedId) throw new Error('no insertedId');
    }, TIMEOUT_MS);

    await assert('find the inserted document by _id', async () => {
      const doc = await db.collection('_connection_test').findOne({ suite: 'mongo-test' });
      if (!doc) throw new Error('document not found after insert');
    }, TIMEOUT_MS);

    await assert('update document field', async () => {
      const doc = await db.collection('_connection_test').findOne({ suite: 'mongo-test' });
      await db
        .collection('_connection_test')
        .updateOne({ _id: doc._id }, { $set: { updated: true } });
      const updated = await db.collection('_connection_test').findOne({ _id: doc._id });
      if (!updated.updated) throw new Error('update did not persist');
    }, TIMEOUT_MS);

    await assert('delete the test document', async () => {
      const doc = await db.collection('_connection_test').findOne({ suite: 'mongo-test' });
      await db.collection('_connection_test').deleteOne({ _id: doc._id });
      const gone = await db.collection('_connection_test').findOne({ _id: doc._id });
      if (gone) throw new Error('document still exists after delete');
    }, TIMEOUT_MS);

    await assert('aggregation pipeline (group+sum)', async () => {
      await db.collection('_agg_test').insertMany([
        { group: 'a', val: 10 },
        { group: 'a', val: 20 },
        { group: 'b', val: 5 },
      ]);
      const result = await db
        .collection('_agg_test')
        .aggregate([{ $group: { _id: '$group', total: { $sum: '$val' } } }, { $sort: { total: -1 } }])
        .toArray();
      await db.collection('_agg_test').deleteMany({});
      if (result.length < 1) throw new Error('aggregation returned no groups');
      if (result[0].total !== 30) throw new Error(`expected 30 got ${result[0].total}`);
    }, TIMEOUT_MS);

  } catch (err) {
    console.error('\n✗ Fatal:', err.message);
    failed++;
  } finally {
    try {
      if (db) await db.collection('_connection_test').deleteMany({});
      if (db) await db.collection('_agg_test').deleteMany({});
      if (client) await client.close();
    } catch (e) {
      // cleanup non-fatal
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? '\n=== MongoDB fully operational ===' : '\n=== MongoDB verification FAILED ===');

  process.exit(failed === 0 ? 0 : 1);
}

runTests();
