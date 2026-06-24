import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" id="email-input" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    render(<Input label="Email" id="email-input" error="Email is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
  });

  it('has aria-invalid when error is present', () => {
    render(<Input label="Email" id="email-input" error="Invalid email" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows helper text when provided', () => {
    render(<Input label="Password" id="password-input" helperText="Must be at least 6 characters" />);
    expect(screen.getByText(/must be at least 6 characters/i)).toBeInTheDocument();
  });

  it('generates id from label when not provided', () => {
    render(<Input label="Full Name" />);
    const input = screen.getByLabelText(/full name/i);
    expect(input).toHaveAttribute('id', 'input-full-name');
  });

  it('supports different input types', () => {
    render(<Input label="Password" id="password-input" type="password" />);
    const input = screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'password');
  });
});