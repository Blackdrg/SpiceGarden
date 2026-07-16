import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';

jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest
    .fn()
    .mockResolvedValue({ coords: { latitude: 0, longitude: 0, accuracy: 1 } }),
  reverseGeocodeAsync: jest.fn().mockResolvedValue([]),
  hasServicesEnabledAsync: jest.fn().mockResolvedValue(true),
  enableNetworkProviderAsync: jest.fn(),
  LocationAccuracy: { Balanced: 4, High: 5 },
  LocationActivityType: { Other: 'other' },
  Location: {},
}));

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
    global.fetch.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ access_token: 'test-token' }),
        });
      }
      if (typeof url === 'string' && url.includes('/restaurants')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 'r1', name: 'Burger King', description: 'Burgers', branches: [{ openingTime: '10:00', closingTime: '22:00' }], logoUrl: '', bannerUrl: '' },
              { id: 'r2', name: 'Pizza Hub', description: 'Pizza', branches: [{ openingTime: '11:00', closingTime: '23:00' }], logoUrl: '', bannerUrl: '' },
            ]),
        });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
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
