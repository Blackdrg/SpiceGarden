"use client";

import React, { useState } from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';
import { Button } from './Button';
import { useFlow } from './useFlow';

interface FlowManagerProps {
  flowId: string
  steps: Array<{ id: string; label: string }>
  onComplete?: () => void
  onError?: (error: string) => void
}

export const FlowManager: React.FC<FlowManagerProps> = ({
  flowId,
  steps,
  onComplete,
  onError,
}) => {
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
    return (
      <div style={{ textAlign: 'center', padding: DESIGN_TOKENS.spacing[10] }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: DESIGN_TOKENS.radius.full,
          backgroundColor: DESIGN_TOKENS.colors.successLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: `0 auto ${DESIGN_TOKENS.spacing[5]}px`,
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={DESIGN_TOKENS.colors.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 style={{ margin: 0, marginBottom: DESIGN_TOKENS.spacing[3], ...DESIGN_TOKENS.typography.headingM, color: DESIGN_TOKENS.colors.textPrimary }}>
          Flow Complete!
        </h2>
        <p style={{ margin: 0, ...DESIGN_TOKENS.typography.bodySmall, color: DESIGN_TOKENS.colors.textSecondary }}>
          You have successfully completed all steps.
        </p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div style={{ padding: DESIGN_TOKENS.spacing[6], textAlign: 'center' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: DESIGN_TOKENS.radius.full,
          backgroundColor: DESIGN_TOKENS.colors.dangerLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: `0 auto ${DESIGN_TOKENS.spacing[5]}px`,
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={DESIGN_TOKENS.colors.danger} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 style={{ margin: 0, marginBottom: DESIGN_TOKENS.spacing[3], ...DESIGN_TOKENS.typography.headingM, color: DESIGN_TOKENS.colors.danger }}>
          Error
        </h2>
        <p style={{ margin: 0, ...DESIGN_TOKENS.typography.bodySmall, color: DESIGN_TOKENS.colors.textSecondary, marginBottom: DESIGN_TOKENS.spacing[5] }}>
          {error}
        </p>
        <Button label="Retry" onClick={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: DESIGN_TOKENS.spacing[6] }}>
      <div style={{ display: 'flex', marginBottom: DESIGN_TOKENS.spacing[8], gap: DESIGN_TOKENS.spacing[2] }}>
        {steps.map((step, idx) => (
          <div
            key={step.id}
            style={{
              flex: 1,
              height: 4,
              background: idx <= currentStepIndex ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.border,
              borderRadius: DESIGN_TOKENS.radius.sm,
              transition: `background ${DESIGN_TOKENS.motion.standard}ms ${MOTION_EASING.easeInOut}`,
            }}
          />
        ))}
      </div>

      <div style={{ marginBottom: DESIGN_TOKENS.spacing[8] }}>
        <h2 style={{ margin: 0, ...DESIGN_TOKENS.typography.headingM, color: DESIGN_TOKENS.colors.textPrimary }}>
          {steps[currentStepIndex]?.label}
        </h2>
      </div>

      <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing[4], justifyContent: 'space-between' }}>
        <Button
          label="Previous"
          variant="secondary"
          onClick={back}
          disabled={currentStepIndex === 0}
        />
        <Button
          label={currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
          onClick={() => {
            next();
            setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
          }}
        />
      </div>
    </div>
  );
};
