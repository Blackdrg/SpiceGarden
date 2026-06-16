import { ApisService } from './apis.service';
export declare class ApisController {
    private readonly apisService;
    constructor(apisService: ApisService);
    getApis(restaurantId?: string): unknown;
    getApisById(menuId: string): unknown;
}
