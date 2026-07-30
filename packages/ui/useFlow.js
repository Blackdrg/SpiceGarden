"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFlow = void 0;
const react_1 = require("react");
const analytics_1 = require("./analytics");
const useFlow = ({ flowId, steps, onComplete, onError }) => {
    const [state, setState] = (0, react_1.useState)('idle');
    const [completedSteps, setCompletedSteps] = (0, react_1.useState)([]);
    const [currentStep, setCurrentStep] = (0, react_1.useState)(0);
    const [error, setFlowError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        (0, analytics_1.trackEvent)({
            event: 'flow_started',
            properties: {
                flowId,
                totalSteps: steps.length
            }
        });
    }, [flowId, steps.length]);
    const next = (0, react_1.useCallback)(() => {
        setCompletedSteps(prev => [...prev, steps[currentStep].id]);
        const newStep = currentStep + 1;
        (0, analytics_1.trackEvent)({
            event: 'flow_step_completed',
            properties: {
                flowId,
                stepId: steps[currentStep].id,
                stepNumber: currentStep + 1
            }
        });
        if (newStep >= steps.length) {
            setState('success');
            (0, analytics_1.trackEvent)({
                event: 'flow_completed',
                properties: {
                    flowId,
                    stepsCompleted: steps.length
                }
            });
            onComplete?.();
        }
        else {
            setCurrentStep(prev => { if (prev < steps.length - 1)
                return prev + 1; return prev; });
        }
    }, [currentStep, flowId, steps, onComplete]);
    const back = (0, react_1.useCallback)(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => Math.max(0, prev - 1));
        }
    }, [currentStep]);
    const fail = (0, react_1.useCallback)((errorMessage) => {
        setState('error');
        setFlowError(errorMessage);
        (0, analytics_1.trackEvent)({
            event: 'flow_error',
            properties: {
                flowId,
                error: errorMessage
            }
        });
        onError?.(errorMessage);
    }, [flowId, onError]);
    return {
        state,
        currentStep,
        completedSteps,
        error,
        next,
        back,
        fail,
        setState,
    };
};
exports.useFlow = useFlow;
