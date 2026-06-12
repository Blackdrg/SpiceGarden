import type { NextApiRequest, NextApiResponse } from 'next';

const mockRestaurants = [
  {
    id: '1',
    name: 'Spice Garden Kitchen',
    description: 'Authentic Indian spices & flavors',
    rating: 4.8,
    deliveryTime: 25,
    isActive: true,
  },
  {
    id: '2',
    name: 'The Burger House',
    description: 'Juicy burgers & crispy fries',
    rating: 4.5,
    deliveryTime: 30,
    isActive: true,
  },
  {
    id: '3',
    name: 'Pizza Palace',
    description: 'Wood-fired pizzas made fresh',
    rating: 4.6,
    deliveryTime: 35,
    isActive: true,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(mockRestaurants);
}