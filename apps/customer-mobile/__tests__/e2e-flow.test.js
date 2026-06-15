import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';

const storage = AsyncStorage.default || AsyncStorage;

class ErrorBoundary extends React.Component {
  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    return this.props.children;
  }
}

describe('Customer Mobile App - Full E2E Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.getItem.mockResolvedValue(null);
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'test-token' }),
    });
  });

  it('completes login and opens the authenticated cart screen', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
    );

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'customer@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    await waitFor(() => {
      expect(storage.setItem).toHaveBeenCalledWith('sg_token', 'test-token');
      expect(storage.setItem).toHaveBeenCalledWith(
        'sg_user',
        JSON.stringify({
          email: 'customer@example.com',
          name: '',
          phone: '',
        }),
      );
    });

    await waitFor(() => {
      expect(getByText('Burger King')).toBeTruthy();
    });

    fireEvent.press(getByText('Cart'));

    await waitFor(() => {
      expect(getByText('Your cart is empty')).toBeTruthy();
    });
  });
});
