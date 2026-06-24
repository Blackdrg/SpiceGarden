jest.unmock('mongodb');
const { MongoClient, Db } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spicegarden';
const TEST_DB = 'spicegarden_test';
const TEST_TIMEOUT = 30000;
const COLLECTION_PREFIX = `_test_${Date.now()}`;

describe('MongoDB Integration', () => {
  let client: any;
  let db: any;
  let collectionName: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    collectionName = `${COLLECTION_PREFIX}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      db = client.db(TEST_DB);
      await db.collection(collectionName).drop().catch(() => {});
    } catch (e) {
      client = null;
      db = null;
    }
  }, TEST_TIMEOUT);

  afterAll(async () => {
    try {
      if (db) {
        await db.collection(collectionName).drop().catch(() => {});
      }
      if (client) {
        await client.close();
      }
    } catch (e) {
      // cleanup errors are non-fatal
    }
  }, TEST_TIMEOUT);

  beforeEach(async () => {
    if (!db) return;
    try {
      await db.collection(collectionName).deleteMany({});
    } catch (e) {
      // cleanup errors are non-fatal
    }
  });

  it('should have valid MONGO_URI config', () => {
    expect(MONGO_URI).toBeDefined();
    expect(MONGO_URI).toMatch(/^mongodb:\/\//);
  });

  it('should connect via MongoClient', async () => {
    if (!client || !db) {
      throw new Error('MongoDB client not initialized — connection failed in beforeAll');
    }
    expect(db).toBeDefined();
    expect(db.databaseName).toBe(TEST_DB);
  }, TEST_TIMEOUT);

  it('should report server version', async () => {
    if (!db) throw new Error('MongoDB not connected');
    const status = await db.admin().serverStatus();
    expect(status.version).toBeDefined();
    expect(typeof status.version).toBe('string');
    expect(status.version).toMatch(/^\d+\.\d+/);
  }, TEST_TIMEOUT);

  it('should list collections', async () => {
    if (!db) throw new Error('MongoDB not connected');
    const collections = await db.listCollections().toArray();
    expect(Array.isArray(collections)).toBe(true);
  }, TEST_TIMEOUT);

  it('should insert and retrieve documents', async () => {
    if (!db) throw new Error('MongoDB not connected');
    const coll = db.collection(collectionName);
    const doc = {
      suite: 'mongo-integration',
      ts: new Date().toISOString(),
      number: 42,
      flag: true,
      nested: { path: 'ok', arr: [1, 2, 3] },
    };

    const { insertedId } = await coll.insertOne(doc);
    expect(insertedId).toBeDefined();

    const found = await coll.findOne({ _id: insertedId });
    expect(found).toBeDefined();
    expect(found!.suite).toBe('mongo-integration');
    expect(found!.number).toBe(42);
    expect(found!.nested.path).toBe('ok');
  }, TEST_TIMEOUT);

  it('should update and delete documents', async () => {
    if (!db) throw new Error('MongoDB not connected');
    const coll = db.collection(collectionName);
    const { insertedId } = await coll.insertOne({ key: 'upd-del', v: 1 });
    await coll.updateOne({ _id: insertedId }, { $set: { v: 99 } });
    const updated = await coll.findOne({ _id: insertedId });
    expect(updated!.v).toBe(99);
    await coll.deleteOne({ _id: insertedId });
    const gone = await coll.findOne({ _id: insertedId });
    expect(gone).toBeNull();
  }, TEST_TIMEOUT);

  it('should run aggregations', async () => {
    if (!db) throw new Error('MongoDB not connected');
    const coll = db.collection(collectionName);
    await coll.insertOne({ g: 'a', n: 10 });
    await coll.insertOne({ g: 'a', n: 20 });
    await coll.insertOne({ g: 'b', n: 5 });

    const result = await coll
      .aggregate([
        { $group: { _id: '$g', total: { $sum: '$n' } } },
        { $sort: { total: -1 } },
      ])
      .toArray();

    expect(result.length).toBeGreaterThanOrEqual(1);
    const groupA = result.find((r: any) => r._id === 'a');
    expect(groupA).toBeDefined();
    expect(groupA!.total).toBe(30);
  }, TEST_TIMEOUT);
});
