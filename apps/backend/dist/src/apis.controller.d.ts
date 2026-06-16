import { ApisService } from './apis.service';
export declare class ApisController {
    private readonly apisService;
    constructor(apisService: ApisService);
    getApis(restaurantId?: string): Promise<import("./apis.service").MenuResponse>;
    getApisById(menuId: string): Promise<import("./apis.service").MenuResponse>;
}
