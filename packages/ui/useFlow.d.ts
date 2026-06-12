type FlowState = 'idle' | 'in_progress' | 'success' | 'error';
interface FlowStep {
    id: string;
    label: string;
    completed: boolean;
}
interface UseFlowOptions {
    flowId: string;
    steps: FlowStep[];
    onComplete?: () => void;
    onError?: (error: string) => void;
}
export declare const useFlow: ({ flowId, steps, onComplete, onError }: UseFlowOptions) => {
    state: FlowState;
    currentStep: number;
    completedSteps: string[];
    error: string | null;
    next: () => void;
    back: () => void;
    fail: (errorMessage: string) => void;
    setState: import("react").Dispatch<import("react").SetStateAction<FlowState>>;
};
export {};
