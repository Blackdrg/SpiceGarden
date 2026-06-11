const { render, screen, fireEvent } = require('@testing-library/react');

const mockUseFlow = jest.fn();

jest.mock('../useFlow', () => ({
  useFlow: () => mockUseFlow(),
}));

jest.mock('../analytics', () => ({
  trackEvent: jest.fn(),
}));

describe('FlowManager', () => {
  const mockSteps = [
    { id: 'step1', label: 'Step 1' },
    { id: 'step2', label: 'Step 2' },
  ];

  const React = require('react');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders flow with steps', () => {
    mockUseFlow.mockReturnValue({
      state: 'idle',
      error: null,
      next: jest.fn(),
      back: jest.fn(),
    });

    const FlowManager = require('../FlowManager').FlowManager;
    render(React.createElement(FlowManager, { flowId: "test-flow", steps: mockSteps }));
    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });

  it('shows success state when flow completes', () => {
    mockUseFlow.mockReturnValue({
      state: 'success',
      error: null,
      next: jest.fn(),
      back: jest.fn(),
    });

    const FlowManager = require('../FlowManager').FlowManager;
    render(React.createElement(FlowManager, { flowId: "test-flow", steps: mockSteps }));
    expect(screen.getByText('Flow Complete!')).toBeInTheDocument();
  });

  it('shows error state with error message', () => {
    mockUseFlow.mockReturnValue({
      state: 'error',
      error: 'Something went wrong',
      next: jest.fn(),
      back: jest.fn(),
    });

    const FlowManager = require('../FlowManager').FlowManager;
    render(React.createElement(FlowManager, { flowId: "test-flow", steps: mockSteps }));
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has next and previous buttons', () => {
    mockUseFlow.mockReturnValue({
      state: 'idle',
      error: null,
      next: jest.fn(),
      back: jest.fn(),
    });

    const FlowManager = require('../FlowManager').FlowManager;
    render(React.createElement(FlowManager, { flowId: "test-flow", steps: mockSteps }));
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument();
  });

  it('disables previous button on first step', () => {
    mockUseFlow.mockReturnValue({
      state: 'idle',
      error: null,
      next: jest.fn(),
      back: jest.fn(),
    });

    const FlowManager = require('../FlowManager').FlowManager;
    render(React.createElement(FlowManager, { flowId: "test-flow", steps: mockSteps }));
    const prevButton = screen.getByRole('button', { name: /Previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('shows retry button on error', () => {
    mockUseFlow.mockReturnValue({
      state: 'error',
      error: 'Test error',
      next: jest.fn(),
      back: jest.fn(),
    });

    const FlowManager = require('../FlowManager').FlowManager;
    render(React.createElement(FlowManager, { flowId: "test-flow", steps: mockSteps }));
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});