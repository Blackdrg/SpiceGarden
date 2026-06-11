import React from 'react';
import { Button } from './Button';
import { DESIGN_TOKENS } from './tokens';

export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    onClick: { action: 'clicked' },
  },
};

export const Primary = {
  args: {
    label: 'Order Now',
    variant: 'primary',
  },
};

export const Secondary = {
  args: {
    label: 'Cancel',
    variant: 'secondary',
  },
};

export const Destructive = {
  args: {
    label: 'Delete Item',
    variant: 'destructive',
  },
};

export const Outline = {
  args: {
    label: 'View Details',
    variant: 'outline',
  },
};

export const Loading = {
  args: {
    label: 'Loading...',
    variant: 'primary',
    isLoading: true,
  },
};

export const AllVariants = () => (
  <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.md, flexWrap: 'wrap' }}>
    <Button label="Primary" variant="primary" onClick={() => {}} />
    <Button label="Secondary" variant="secondary" onClick={() => {}} />
    <Button label="Ghost" variant="ghost" onClick={() => {}} />
    <Button label="Destructive" variant="destructive" onClick={() => {}} />
    <Button label="Outline" variant="outline" onClick={() => {}} />
  </div>
);