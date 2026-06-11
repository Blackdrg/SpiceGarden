const { render, screen, fireEvent } = require('@testing-library/react');
const { Button } = require('../Button');

describe('Button', () => {
  const React = require('react');

  it('renders with primary variant by default', () => {
    render(React.createElement(Button, { label: 'Click me', onClick: () => {} }));
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with secondary variant', () => {
    render(React.createElement(Button, { label: 'Secondary', onClick: () => {}, variant: 'secondary' }));
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(React.createElement(Button, { label: 'Click me', onClick: handleClick }));
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(React.createElement(Button, { label: 'Disabled', onClick: () => {}, disabled: true }));
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  it('shows loading state', () => {
    render(React.createElement(Button, { label: 'Submit', onClick: () => {}, isLoading: true }));
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(React.createElement(Button, { label: 'Submit', onClick: () => {}, isLoading: true }));
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('has accessible aria-label', () => {
    render(React.createElement(Button, { label: 'Submit', onClick: () => {}, ariaLabel: 'Submit form' }));
    const button = screen.getByRole('button', { name: /submit form/i });
    expect(button).toHaveAttribute('aria-label', 'Submit form');
  });
});