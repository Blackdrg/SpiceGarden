"use client";
import React, { useState } from 'react';
import { DESIGN_TOKENS } from './tokens';
import { Button } from './Button';
import { useFlow } from './useFlow';
import { CheckCircle, AlertCircle } from 'lucide-react';
export const FlowManager = ({ flowId, steps, onComplete, onError }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const { state, error, next, back } = useFlow({
        flowId,
        steps: steps.map(s => ({ ...s, completed: false })),
        onComplete: () => {
            setCurrentStepIndex(steps.length - 1);
            onComplete?.();
        },
        onError,
    });
    if (state === 'success') {
        return (React.createElement("div", { style: { textAlign: 'center', padding: DESIGN_TOKENS.spacing.xl } },
            React.createElement("h2", { style: { display: 'inline-flex', alignItems: 'center', gap: 8 } },
                React.createElement(CheckCircle, { size: 24, color: DESIGN_TOKENS.colors.success }),
                " Flow Complete!"),
            React.createElement("p", null, "You have successfully completed all steps.")));
    }
    if (state === 'error') {
        return (React.createElement("div", { style: { padding: DESIGN_TOKENS.spacing.lg } },
            React.createElement("h2", { style: { color: DESIGN_TOKENS.colors.danger, display: 'inline-flex', alignItems: 'center', gap: 8 } },
                React.createElement(AlertCircle, { size: 24 }),
                " Error"),
            React.createElement("p", null, error),
            React.createElement(Button, { label: "Retry", onClick: () => window.location.reload() })));
    }
    return (React.createElement("div", { style: { maxWidth: 600, margin: '0 auto', padding: DESIGN_TOKENS.spacing.lg } },
        React.createElement("div", { style: { display: 'flex', marginBottom: DESIGN_TOKENS.spacing.xl, gap: DESIGN_TOKENS.spacing.sm } }, steps.map((step, idx) => (React.createElement("div", { key: step.id, style: {
                flex: 1,
                height: 4,
                background: idx <= currentStepIndex ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.border,
                borderRadius: DESIGN_TOKENS.radius.sm,
            } })))),
        React.createElement("div", { style: { marginBottom: DESIGN_TOKENS.spacing.xl } },
            React.createElement("h2", null, steps[currentStepIndex]?.label)),
        React.createElement("div", { style: { display: 'flex', gap: DESIGN_TOKENS.spacing.md, justifyContent: 'space-between' } },
            React.createElement(Button, { label: "Previous", variant: "secondary", onClick: back, disabled: currentStepIndex === 0 }),
            React.createElement(Button, { label: currentStepIndex === steps.length - 1 ? 'Complete' : 'Next', onClick: () => {
                    next();
                    setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
                } }))));
};
