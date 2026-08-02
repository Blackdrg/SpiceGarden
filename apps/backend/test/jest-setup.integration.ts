import 'reflect-metadata';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-integration-tests';
process.env.ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'test-encryption-secret-32-bytes';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

jest.mock('ioredis', () => {
  const mem = new Map<string, { hits: number; expiresAt: number }>();
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    ping: jest.fn().mockRejectedValue(new Error('not connected')),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    pexpire: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    decr: jest.fn().mockResolvedValue(0),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    multi: jest.fn(() => ({
      incr: jest.fn().mockReturnThis(),
      pexpire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([[null, 1]]),
    })),
    disconnect: jest.fn(),
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue('OK'),
  }));
});

jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        deleteMany: jest.fn().mockResolvedValue({}),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
        findOne: jest.fn().mockResolvedValue({}),
        updateOne: jest.fn().mockResolvedValue({}),
        deleteOne: jest.fn().mockResolvedValue({}),
        insertMany: jest.fn().mockResolvedValue({}),
        aggregate: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
        listCollections: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
      }),
      admin: jest.fn().mockReturnValue({ serverStatus: jest.fn().mockResolvedValue({ version: '7.0.0' }) }),
      databaseName: 'test-db',
    }),
    close: jest.fn().mockResolvedValue(undefined),
  })),
  Db: jest.fn(),
}));
