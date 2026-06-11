import type { Meta, StoryObj } from '@storybook/react';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Inputs/SearchInput',
  component: SearchInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search restaurants...',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Search...',
    value: 'Pizza',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Search...',
    disabled: true,
  },
};