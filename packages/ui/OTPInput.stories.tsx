import type { Meta, StoryObj } from '@storybook/react';
import { OTPInput } from './OTPInput';

const meta: Meta<typeof OTPInput> = {
  title: 'Inputs/OTPInput',
  component: OTPInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    length: { control: 'select', options: [4, 6] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FourDigit: Story = {
  args: {
    length: 4,
  },
};

export const SixDigit: Story = {
  args: {
    length: 6,
  },
};

export const WithError: Story = {
  args: {
    length: 4,
    error: 'Invalid OTP code',
  },
};

export const Disabled: Story = {
  args: {
    length: 4,
    disabled: true,
  },
};