import type { Meta, StoryObj } from '@storybook/react';
import { TrackingCard } from './Cards';

const meta: Meta<typeof TrackingCard> = {
  title: 'Cards/TrackingCard',
  component: TrackingCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['preparing', 'picked-up', 'on-the-way', 'delivered'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Preparing: Story = {
  args: {
    status: 'preparing',
    eta: 25,
  },
};

export const PickedUp: Story = {
  args: {
    status: 'picked-up',
    eta: 15,
    address: 'Delivering to MG Road',
  },
};

export const OnTheWay: Story = {
  args: {
    status: 'on-the-way',
    eta: 8,
    address: 'Near MG Road, Bangalore',
    onContact: () => console.log('Contact driver'),
    onSupport: () => console.log('Support ticket'),
  },
};

export const Delivered: Story = {
  args: {
    status: 'delivered',
    eta: 0,
    address: 'Delivered to MG Road',
  },
};