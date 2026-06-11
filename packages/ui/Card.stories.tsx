import React from 'react';
import { Card } from './Card';
import { DESIGN_TOKENS } from './tokens';

export default {
  title: 'UI/Card',
  component: Card,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'list'],
    },
  },
};

export const Default = {
  args: {
    title: 'Restaurant Card',
    children: 'This is a default card with some content.',
  },
};

export const Elevated = {
  args: {
    title: 'Premium Card',
    variant: 'elevated',
    children: 'This is an elevated card with larger shadow.',
  },
};

export const WithoutTitle = {
  args: {
    children: 'This card has no title, just content.',
  },
};

export const AllVariants = () => (
  <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.md, flexDirection: 'column' }}>
    <Card title="Default Card" variant="default">
      Standard card variant
    </Card>
    <Card title="Elevated Card" variant="elevated">
      Elevated card with larger shadow
    </Card>
    <Card title="List Card" variant="list">
      List-style card for items
    </Card>
  </div>
);