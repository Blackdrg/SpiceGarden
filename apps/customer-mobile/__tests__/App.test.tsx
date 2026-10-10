import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders welcome message', () => {
    const { getByText } = render(<App />);
    expect(getByText(/SpiceGarden/i)).toBeTruthy();
  });
});