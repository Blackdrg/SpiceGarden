import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Inputs/Stepper',
  component: Stepper,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 1,
    onChange: () => {},
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Quantity',
    value: 2,
    onChange: () => {},
  },
};

export const AtMax: Story = {
  args: {
    label: 'Quantity',
    value: 10,
    min: 1,
    max: 10,
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    label: 'Quantity',
    value: 1,
    disabled: true,
  },
};