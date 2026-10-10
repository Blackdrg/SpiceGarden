import { useState, useEffect, useCallback } from 'react';
import { trackEvent } from './analytics';
export const useFlow = ({ flowId, steps, onComplete, onError }) => {
    const [state, setState] = useState('idle');
    const [completedSteps, setCompletedSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setFlowError] = useState(null);
    useEffect(() => {
        trackEvent({
            event: 'flow_started',
            properties: {
                flowId,
                totalSteps: steps.length
            }
        });
    }, [flowId, steps.length]);
    const next = useCallback(() => {
        setCompletedSteps(prev => [...prev, steps[currentStep].id]);
        const newStep = currentStep + 1;
        trackEvent({
            event: 'flow_step_completed',
            properties: {
                flowId,
                stepId: steps[currentStep].id,
                stepNumber: currentStep + 1
            }
        });
        if (newStep >= steps.length) {
            setState('success');
            trackEvent({
                event: 'flow_completed',
                properties: {
                    flowId,
                    stepsCompleted: steps.length
                }
            });
            onComplete?.();
        }
        else {
            setCurrentStep(newStep);
        }
    }, [currentStep, flowId, steps, onComplete]);
    const back = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }, [currentStep]);
    const fail = useCallback((errorMessage) => {
        setState('error');
        setFlowError(errorMessage);
        trackEvent({
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
