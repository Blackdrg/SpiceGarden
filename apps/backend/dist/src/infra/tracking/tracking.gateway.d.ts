import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../../db/entities/notification.entity';
export declare enum SocketNamespace {
    TRACKING = "/tracking",
    KDS = "/kds",
    ADMIN = "/admin",
    DRIVER = "/driver"
}
interface LocationUpdate {
    driverId: string;
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    timestamp?: number;
}
interface AcknowledgedMessage {
    id: string;
    event: string;
    data: any;
    timestamp: Date;
    ack?: boolean;
}
export declare class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private configService;
    private readonly notificationRepo;
    server: Server;
    private readonly logger;
    private readonly connectedClients;
    private readonly connectionAttempts;
    private readonly messageQueue;
    private readonly pendingAcks;
    private readonly ackTimeoutMs;
    constructor(configService: ConfigService, notificationRepo: Repository<NotificationEntity>);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private isConnectionAllowed;
    handlePing(client: Socket): {
        status: string;
        serverTime: number;
    };
    handleJoin(data: {
        room: string;
    }, client: Socket): {
        error: string;
        status?: undefined;
        room?: undefined;
    } | {
        status: string;
        room: string;
        error?: undefined;
    };
    handleAcknowledgement(data: {
        messageId: string;
    }, client: Socket): {
        status: string;
    };
    handleMessage(data: AcknowledgedMessage, client: Socket): Promise<unknown>;
    handleLocationUpdate(data: LocationUpdate, client: Socket): Promise<{
        error: string;
        status?: undefined;
        messageId?: undefined;
    } | {
        status: string;
        messageId: string;
        error?: undefined;
    }>;
    handleKDSUpdate(data: {
        orderId: string;
        status: string;
        branchId: string;
        timestamp?: Date;
    }): Promise<{
        error: string;
        status?: undefined;
        messageId?: undefined;
    } | {
        status: string;
        messageId: string;
        error?: undefined;
    }>;
    handleDriverEvent(data: {
        driverId: string;
        orderId?: string;
        event: string;
    }): Promise<{
        error: string;
        status?: undefined;
        messageId?: undefined;
    } | {
        status: string;
        messageId: string;
        error?: undefined;
    }>;
    publish(topic: string, data: any, requireAck?: boolean): Promise<any>;
    publishToRoom(room: string, data: any, requireAck?: boolean): Promise<any>;
    getActiveConnections(): number;
    getNamespaceStats(): Record<string, number>;
    private isValidLocation;
    private checkOfflineTimeout;
    private waitForAcknowledgement;
    private cleanupPendingAcks;
    private cleanupStaleConnectionAttempts;
    private cleanupStaleMessageQueue;
    getQueuedMessages(driverId: string): Promise<AcknowledgedMessage[]>;
    requeueUndeliveredMessages(driverId: string, messageIds: string[]): Promise<void>;
}
export {};
