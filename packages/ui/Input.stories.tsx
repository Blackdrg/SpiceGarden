import React, { useState } from 'react';
import { Input } from './Input';
import { DESIGN_TOKENS } from './tokens';

export default {
  title: 'UI/Input',
  component: Input,
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel'],
    },
  },
};

export const Default = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const Password = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
  },
};

export const WithError = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address',
  },
};

export const WithHelperText = {
  args: {
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    helperText: 'Used for delivery updates',
    type: 'tel',
  },
};

export const InteractiveForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value: string) => {
    if (!value) {
      setError('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Please enter a valid email');
    } else {
      setError('');
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        value={email}
        error={error}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) validateEmail(e.target.value);
        }}
      />
      <Input label="Password" type="password" placeholder="Enter your password" />
    </div>
  );
};