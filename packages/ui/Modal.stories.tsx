import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Overlays/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Modal Title',
    children: <p>This is a modal dialog with some content.</p>,
  },
};

export const Small: Story = {
  args: {
    isOpen: true,
    size: 'sm',
    title: 'Confirmation',
    children: <p>Are you sure you want to continue?</p>,
  },
};

export const Large: Story = {
  args: {
    isOpen: true,
    size: 'lg',
    title: 'Large Modal',
    children: (
      <div>
        <p>This is a large modal with more content.</p>
        <p>It can contain forms, tables, or other complex components.</p>
      </div>
    ),
  },
};