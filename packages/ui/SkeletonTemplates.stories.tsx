import type { Meta, StoryObj } from '@storybook/react';
import { ProductListSkeleton, MenuListSkeleton, CheckoutSkeleton, TrackingSkeleton, TimelineTrackingSkeleton } from './SkeletonTemplates';

const meta: Meta<typeof ProductListSkeleton> = {
  title: 'Skeletons/ProductListSkeleton',
  component: ProductListSkeleton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoItems: Story = { args: { count: 2 } };
export const ThreeItems: Story = { args: { count: 3 } };
export const FiveItems: Story = { args: { count: 5 } };

export const MenuListSkeletonStory: Story = {
  render: () => <MenuListSkeleton count={4} />,
  parameters: { title: 'Skeletons/MenuListSkeleton' },
};

export const CheckoutSkeletonStory: Story = {
  render: () => <CheckoutSkeleton itemCount={3} />,
  parameters: { title: 'Skeletons/CheckoutSkeleton' },
};

export const TrackingSkeletonStory: Story = {
  render: () => <TrackingSkeleton stages={4} />,
  parameters: { title: 'Skeletons/TrackingSkeleton' },
};

export const TimelineTrackingSkeletonStory: Story = {
  render: () => <TimelineTrackingSkeleton stages={5} />,
  parameters: { title: 'Skeletons/TimelineTrackingSkeleton' },
};