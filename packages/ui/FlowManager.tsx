"use client";

import React, { useState } from 'react'
import { DESIGN_TOKENS } from './tokens'
import { Button } from './Button'
import { useFlow } from './useFlow'
import { CheckCircle, AlertCircle } from 'lucide-react'

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
  onError 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const { state, error, next, back } = useFlow({
    flowId,
    steps: steps.map(s => ({ ...s, completed: false })),
    onComplete: () => {
      setCurrentStepIndex(steps.length - 1)
      onComplete?.()
    },
    onError,
  })

  if (state === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: DESIGN_TOKENS.spacing.xl }}>
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><CheckCircle size={24} color={DESIGN_TOKENS.colors.success} /> Flow Complete!</h2>
        <p>You have successfully completed all steps.</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div style={{ padding: DESIGN_TOKENS.spacing.lg }}>
        <h2 style={{ color: DESIGN_TOKENS.colors.danger, display: 'inline-flex', alignItems: 'center', gap: 8 }}><AlertCircle size={24} /> Error</h2>
        <p>{error}</p>
        <Button label="Retry" onClick={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: DESIGN_TOKENS.spacing.lg }}>
      <div style={{ display: 'flex', marginBottom: DESIGN_TOKENS.spacing.xl, gap: DESIGN_TOKENS.spacing.sm }}>
        {steps.map((step, idx) => (
          <div 
            key={step.id}
            style={{
              flex: 1,
              height: 4,
              background: idx <= currentStepIndex ? DESIGN_TOKENS.colors.primary : DESIGN_TOKENS.colors.border,
              borderRadius: DESIGN_TOKENS.radius.sm,
            }}
          />
        ))}
      </div>
      
      <div style={{ marginBottom: DESIGN_TOKENS.spacing.xl }}>
        <h2>{steps[currentStepIndex]?.label}</h2>
      </div>

      <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.md, justifyContent: 'space-between' }}>
        <Button 
          label="Previous" 
          variant="secondary" 
          onClick={back}
          disabled={currentStepIndex === 0}
        />
        <Button 
          label={currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'} 
          onClick={() => {
            next()
            setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1))
          }}
        />
      </div>
    </div>
  )
}