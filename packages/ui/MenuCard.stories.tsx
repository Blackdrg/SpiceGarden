import type { Meta, StoryObj } from '@storybook/react';
import { MenuCard } from './Cards';

const meta: Meta<typeof MenuCard> = {
  title: 'Cards/MenuCard',
  component: MenuCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['section', 'item', 'combo'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ItemDefault: Story = {
  args: {
    variant: 'item',
    title: 'Margherita Pizza',
    description: 'Classic cheese pizza with tomato sauce',
    price: 299,
  },
};

export const SectionCard: Story = {
  args: {
    variant: 'section',
    title: 'Starters',
    description: 'Begin your meal with our delicious starters',
  },
};

export const ComboMeal: Story = {
  args: {
    variant: 'combo',
    title: 'Family Combo',
    description: '2 Large Pizzas + 4 Drinks + Garlic Bread',
    price: 899,
  },
};