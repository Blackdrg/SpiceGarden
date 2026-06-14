import { useEffect, useReducer } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '@spicegarden/shared/constants';

type TrackingState = {
  location: { lat: number; lng: number } | null;
  connected: boolean;
  error: string | null;
};

type TrackingAction =
  | { type: 'connected' }
  | { type: 'disconnected' }
  | { type: 'connection-error'; error: string }
  | { type: 'location'; location: { lat: number; lng: number } };

const initialState: TrackingState = {
  location: null,
  connected: false,
  error: null,
};

function trackingReducer(state: TrackingState, action: TrackingAction): TrackingState {
  switch (action.type) {
    case 'connected':
      return { ...state, connected: true, error: null };
    case 'disconnected':
      return { ...state, connected: false };
    case 'connection-error':
      return { ...state, connected: false, error: action.error };
    case 'location':
      return { ...state, location: action.location };
  }
}

export const useTracking = (driverId: string | null) => {
  const [state, dispatch] = useReducer(trackingReducer, initialState);

  useEffect(() => {
    if (!driverId) return;

    const newSocket = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
    });

    const onConnect = () => dispatch({ type: 'connected' });
    const onDisconnect = () => dispatch({ type: 'disconnected' });
    const onConnectError = () => dispatch({ type: 'connection-error', error: 'Socket disconnected — tracking may be unavailable' });

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('connect_error', onConnectError);

    newSocket.on(`tracking:${driverId}`, (data: { lat: number; lng: number }) => {
      dispatch({ type: 'location', location: data });
    });

    return () => {
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      newSocket.off('connect_error', onConnectError);
      newSocket.off(`tracking:${driverId}`);
      newSocket.disconnect();
    };
  }, [driverId]);

  return { location: state.location, connected: state.connected, error: state.error };
};
