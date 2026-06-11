import type { Meta, StoryObj } from '@storybook/react';
import { ReviewCard } from './Cards';

const meta: Meta<typeof ReviewCard> = {
  title: 'Cards/ReviewCard',
  component: ReviewCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    orderId: '#SG-12345',
  },
};