import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Inputs/Dropdown',
  component: Dropdown,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [
  { value: 'pizza', label: 'Pizza' },
  { value: 'burger', label: 'Burger' },
  { value: 'pasta', label: 'Pasta' },
  { value: 'salad', label: 'Salad' },
];

export const Default: Story = {
  args: {
    placeholder: 'Select a category',
    options: sampleOptions,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Food Category',
    placeholder: 'Select a category',
    options: sampleOptions,
  },
};

export const WithSelectedValue: Story = {
  args: {
    label: 'Food Category',
    options: sampleOptions,
    value: 'pizza',
  },
};

export const WithError: Story = {
  args: {
    label: 'Food Category',
    placeholder: 'Select a category',
    options: sampleOptions,
    error: 'Please select a category',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Food Category',
    options: sampleOptions,
    disabled: true,
  },
};