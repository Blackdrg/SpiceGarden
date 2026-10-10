import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisIoAdapter extends IoAdapter {
    private readonly configService?;
    private readonly logger;
    private adapterConstructor;
    private pubClient;
    private subClient;
    constructor(appOrHttpServer: INestApplicationContext | any, configService?: ConfigService | undefined);
    connectToRedis(): Promise<void>;
    createIOServer(port: number, options?: ServerOptions): any;
    close(): Promise<void>;
}
