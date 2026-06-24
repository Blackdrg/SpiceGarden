import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthScreen from '../src/screens/AuthScreen';

const storage = AsyncStorage.default || AsyncStorage;

describe('Customer Mobile Auth Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits login credentials and stores the auth token', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <AuthScreen />
      </NavigationContainer>,
    );

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'customer@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'customer@example.com',
            password: 'password123',
            deviceName: 'mobile',
            deviceType: 'mobile',
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(storage.setItem).toHaveBeenCalledWith('sg_token', 'test-token');
    });
  });
});
