import type { Meta, StoryObj } from '@storybook/react';
import { MapCard } from './Cards';

const meta: Meta<typeof MapCard> = {
  title: 'Cards/MapCard',
  component: MapCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    eta: { control: 'number' },
    progress: { control: 'range', min: 0, max: 100 },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eta: 15,
    riderName: 'Rohan',
    progress: 50,
  },
};

export const NearPickup: Story = {
  args: {
    eta: 5,
    riderName: 'Amit',
    progress: 30,
  },
};

export const NearDelivery: Story = {
  args: {
    eta: 3,
    riderName: 'Priya',
    progress: 90,
  },
};