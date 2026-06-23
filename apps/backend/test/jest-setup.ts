// Jest setup file for mocking modules - must be loaded before test files
import 'reflect-metadata';

// Mock @nestjs/core logger first
jest.mock('@nestjs/core', () => {
  const actualCommon = jest.requireActual('@nestjs/common');
  actualCommon.REQUEST = actualCommon.REQUEST || Symbol('REQUEST');
  const actual = jest.requireActual('@nestjs/core');
  return Object.assign(function () {}, actual, {
    Logger: class MockLogger {
      log() {}
      error() {}
      warn() {}
      debug() {}
      verbose() {}
    },
  });
});

// Mock @nestjs/typeorm
jest.mock('@nestjs/typeorm', () => {
  const actual = jest.requireActual('@nestjs/typeorm');
  return {
    ...actual,
    InjectRepository: actual.InjectRepository,
    getRepositoryToken: actual.getRepositoryToken,
  };
});

// Mock typeorm
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    DataSource: class MockDataSource {},
    Repository: class MockRepository {},
  };
});

// Mock @nestjs/common
jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    Injectable: () => jest.fn(),
    Controller: () => jest.fn(),
    Get: () => jest.fn(),
    Post: () => jest.fn(),
    Patch: () => jest.fn(),
    Delete: () => jest.fn(),
    Put: () => jest.fn(),
    Body: () => jest.fn(),
    Param: () => jest.fn(),
    Query: () => jest.fn(),
    Headers: () => jest.fn(),
    Req: () => jest.fn(),
    REQUEST: actual.REQUEST || Symbol('REQUEST'),
    Scope: actual.Scope || {
      DEFAULT: 0,
      TRANSIENT: 1,
      REQUEST: 2,
    },
    Logger: class Logger {
      constructor(private readonly context?: string) {}
      static overrideLogger() {}
      log(message: unknown) { return { context: this.context, message }; }
      error(message: unknown) { return { context: this.context, message }; }
      warn(message: unknown) { return { context: this.context, message }; }
      debug(message: unknown) { return { context: this.context, message }; }
      verbose(message: unknown) { return { context: this.context, message }; }
    },
    ConsoleLogger: class ConsoleLogger {
      constructor(private readonly context?: string) {}
      static overrideLogger() {}
      log(message: unknown) { return { context: this.context, message }; }
      error(message: unknown) { return { context: this.context, message }; }
      warn(message: unknown) { return { context: this.context, message }; }
      debug(message: unknown) { return { context: this.context, message }; }
      verbose(message: unknown) { return { context: this.context, message }; }
    },
  };
});

// Mock @nestjs/config
jest.mock('@nestjs/config', () => ({
  ConfigModule: { forRoot: jest.fn().mockReturnValue({}) },
  ConfigService: jest.fn(),
}));

// Mock @nestjs/mongoose
jest.mock('@nestjs/mongoose', () => ({
  MongooseModule: { forRoot: jest.fn().mockReturnValue({}), forFeature: jest.fn().mockReturnValue({}) },
  InjectModel: () => jest.fn(),
}));

// Mock mongoose
jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  connect: jest.fn(),
}));

// Mock mongodb (MongoClient)
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

// Mock stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: { create: jest.fn(), retrieve: jest.fn(), confirm: jest.fn(), cancel: jest.fn() },
    refunds: { create: jest.fn() },
    webhooks: { constructEvent: jest.fn() },
  }));
});

// Mock crypto
const actualCrypto = jest.requireActual('crypto');
jest.mock('crypto', () => ({
  ...actualCrypto,
  randomUUID: () => 'mock-uuid',
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(),
  decode: jest.fn(),
}));