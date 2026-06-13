import { MongoClient, Db } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spicegarden';
const TEST_DB = 'spicegarden_test';
const TEST_TIMEOUT = 15000;

describe('MongoDB Integration', () => {
  let client: MongoClient;
  let db: Db;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  }, TEST_TIMEOUT);

  afterAll(async () => {
    try {
      if (db) {
        await db.collection('_connection_test').deleteMany({});
      }
      if (client) {
        await client.close();
      }
    } catch (e) {
      // cleanup errors are non-fatal
    }
  }, TEST_TIMEOUT);

  afterEach(async () => {
    try {
      if (db) {
        await db.collection('_connection_test').deleteMany({});
      }
    } catch (e) {
      // cleanup errors are non-fatal
    }
  });

  it('should have valid MONGO_URI config', () => {
    expect(MONGO_URI).toBeDefined();
    expect(MONGO_URI).toMatch(/^mongodb:\/\//);
  });

  it('should connect via MongoClient', async () => {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(TEST_DB);
    expect(db).toBeDefined();
    expect(db.databaseName).toBe(TEST_DB);
  }, TEST_TIMEOUT);

  it('should report server version', async () => {
    const status = await db.admin().serverStatus();
    expect(status.version).toBeDefined();
    expect(typeof status.version).toBe('string');
    expect(status.version).toMatch(/^\d+\.\d+/);
  }, TEST_TIMEOUT);

  it('should list collections', async () => {
    const collections = await db.listCollections().toArray();
    expect(Array.isArray(collections)).toBe(true);
  }, TEST_TIMEOUT);

  it('should insert and retrieve documents', async () => {
    const coll = db.collection('_connection_test');
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
    const coll = db.collection('_connection_test');
    const { insertedId } = await coll.insertOne({ key: 'upd-del', v: 1 });
    await coll.updateOne({ _id: insertedId }, { $set: { v: 99 } });
    const updated = await coll.findOne({ _id: insertedId });
    expect(updated!.v).toBe(99);
    await coll.deleteOne({ _id: insertedId });
    const gone = await coll.findOne({ _id: insertedId });
    expect(gone).toBeNull();
  }, TEST_TIMEOUT);

  it('should run aggregations', async () => {
    const coll = db.collection('_connection_test');
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
    expect(result[0].total).toBe(30);
  }, TEST_TIMEOUT);
});
