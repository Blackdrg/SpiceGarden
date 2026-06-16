import { AiService } from './ai.service';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    getRecs(req: any): unknown;
    askChatbot(message: string): unknown;
    getForecast(branchId: string): unknown;
}
