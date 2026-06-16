declare module 'bullmq' {
  export interface Job<T = any> {
    id: string;
    data: T;
    name: string;
    queueName: string;
    opts: JobsOptions;
    timestamp: number;
    delay: number;
    finishedOn: number;
    processedOn: number;
    stacktrace: string[];
    returnvalue: any;
    attemptsMade: number;
  }

  export interface JobsOptions {
    attempts?: number;
    backoff?: BackoffOptions | number;
    jobId?: string;
    removeOnComplete?: boolean | AgeCount;
    removeOnFail?: boolean | AgeCount;
    delay?: number;
    priority?: number;
  }

  export interface BackoffOptions {
    type: 'exponential' | 'fixed';
    delay: number;
  }

  export interface AgeCount {
    age?: number;
    count?: number;
  }

  export interface QueueSchedulerOptions {
    concurrency?: number;
    lockDuration?: number;
  }

  export interface RedisOptions {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
  }

export class Queue<T = any> {
    constructor(name: string, opts: QueueOptions);
    add(name: string, data: T, opts?: JobsOptions): Promise<Job<T>>;
    getWaitingCount(): Promise<number>;
    getActiveCount(): Promise<number>;
    getCompletedCount(): Promise<number>;
    getFailedCount(): Promise<number>;
    getDelayedCount(): Promise<number>;
    close(): Promise<void>;
    drain(): Promise<void>;
  }

  export interface QueueOptions {
    connection: IORedis;
    prefix?: string;
  }

  export class Worker<T = any> {
    constructor(name: string, processor: (job: any) => Promise<void>, opts: WorkerOptions);
    on(event: 'completed', listener: (job: any) => void): this;
    on(event: 'failed', listener: (job: any | undefined, error: any) => void): this;
    close(): Promise<void>;
  }

  export type QueueName = string;
}