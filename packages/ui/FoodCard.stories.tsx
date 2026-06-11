import type { Meta, StoryObj } from '@storybook/react';
import { FoodCard } from './Cards';

const meta: Meta<typeof FoodCard> = {
  title: 'Cards/FoodCard',
  component: FoodCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    isVeg: { control: 'boolean' },
    spiceLevel: { control: 'select', options: [1, 2, 3] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Margherita Pizza',
    price: 299,
    rating: 4.5,
  },
};

export const WithImage: Story = {
  args: {
    title: 'Chicken Burger',
    price: 199,
    rating: 4.2,
    image: 'https://placehold.co/80x80?text=Burger',
  },
};

export const WithOfferBadge: Story = {
  args: {
    title: 'Cheese Pizza',
    price: 349,
    rating: 4.7,
    offerBadge: '20% OFF',
    image: 'https://placehold.co/80x80?text=Pizza',
  },
};

export const VegDish: Story = {
  args: {
    title: 'Paneer Tikka',
    price: 249,
    rating: 4.3,
    isVeg: true,
    spiceLevel: 2,
    image: 'https://placehold.co/80x80?text=Paneer',
  },
};

export const NonVegSpicy: Story = {
  args: {
    title: 'Spicy Chicken Wings',
    price: 279,
    rating: 4.6,
    isVeg: false,
    spiceLevel: 3,
    image: 'https://placehold.co/80x80?text=Wings',
  },
};