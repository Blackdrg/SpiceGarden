import React from 'react';
interface FlowManagerProps {
    flowId: string;
    steps: Array<{
        id: string;
        label: string;
    }>;
    onComplete?: () => void;
    onError?: (error: string) => void;
}
export declare const FlowManager: React.FC<FlowManagerProps>;
export {};
