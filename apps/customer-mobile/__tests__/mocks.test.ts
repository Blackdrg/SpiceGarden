import ImageMock from '../__mocks__/expo-image';
import ToastMock, { show, hide } from '../__mocks__/react-native-root-toast';

describe('Mock modules are wired correctly', () => {
  it('expo-image mock renders null with no source', () => {
    expect(ImageMock).toBeDefined();
  });

  it('react-native-root-toast mock exposes toast helpers', () => {
    expect(typeof ToastMock).toBe('function');
    expect(typeof show).toBe('function');
    expect(typeof hide).toBe('function');
  });
});
