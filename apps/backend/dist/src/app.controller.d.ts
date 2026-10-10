import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHealth(): {
        status: string;
        service: string;
        timestamp: string;
    };
    healthCheck(): {
        status: string;
        timestamp: string;
    };
    liveness(): {
        status: string;
        uptime: number;
        timestamp: number;
    };
    readiness(): {
        status: string;
        timestamp: number;
    };
    startup(): {
        status: string;
        timestamp: number;
    };
}
