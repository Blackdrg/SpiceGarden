import { renderHook, act } from '@testing-library/react';
import { useFlow } from '../useFlow';

jest.mock('../analytics', () => ({
  trackEvent: jest.fn(),
}));

const React = require('react');

describe('useFlow', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useFlow({
      flowId: 'test-flow',
      steps: [{ id: 'step1', label: 'Step 1', completed: false }],
    }));
    expect(result.current.state).toBe('idle');
  });

  it('advances to next step on next()', () => {
    const { result } = renderHook(() => useFlow({
      flowId: 'test-flow',
      steps: [
        { id: 'step1', label: 'Step 1', completed: false },
        { id: 'step2', label: 'Step 2', completed: false },
      ],
    }));

    act(() => {
      result.current.next();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it('completes flow when all steps are done', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useFlow({
      flowId: 'test-flow',
      steps: [
        { id: 'step1', label: 'Step 1', completed: false },
      ],
      onComplete,
    }));

    act(() => {
      result.current.next();
    });

    expect(result.current.state).toBe('success');
    expect(onComplete).toHaveBeenCalled();
  });

  it('goes back to previous step on back()', () => {
    const { result } = renderHook(() => useFlow({
      flowId: 'test-flow',
      steps: [
        { id: 'step1', label: 'Step 1', completed: false },
        { id: 'step2', label: 'Step 2', completed: false },
      ],
    }));

    act(() => {
      result.current.next();
    });
    act(() => {
      result.current.back();
    });

    expect(result.current.currentStep).toBe(0);
  });

  it('handles flow failure with fail()', () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useFlow({
      flowId: 'test-flow',
      steps: [{ id: 'step1', label: 'Step 1', completed: false }],
      onError,
    }));

    act(() => {
      result.current.fail('Something went wrong');
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error).toBe('Something went wrong');
    expect(onError).toHaveBeenCalledWith('Something went wrong');
  });
});